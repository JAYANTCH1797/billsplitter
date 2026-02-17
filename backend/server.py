from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone
import bcrypt
import jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'splitsync-secret-key-2024')
JWT_ALGORITHM = "HS256"

# Create the main app without a prefix
app = FastAPI(title="SplitSync API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

security = HTTPBearer()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    name: str
    created_at: str

class GroupCreate(BaseModel):
    name: str
    description: Optional[str] = ""

class GroupUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class GroupMember(BaseModel):
    user_id: str
    name: str
    email: str

class GroupResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    description: str
    created_by: str
    members: List[GroupMember]
    created_at: str

class SplitDetail(BaseModel):
    user_id: str
    amount: float

class ExpenseCreate(BaseModel):
    group_id: str
    description: str
    amount: float
    paid_by: str
    split_type: str  # 'equal', 'unequal', 'parts', 'percentage'
    splits: List[SplitDetail]
    date: Optional[str] = None

class ExpenseUpdate(BaseModel):
    description: Optional[str] = None
    amount: Optional[float] = None
    paid_by: Optional[str] = None
    split_type: Optional[str] = None
    splits: Optional[List[SplitDetail]] = None

class ExpenseResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    group_id: str
    description: str
    amount: float
    paid_by: str
    paid_by_name: str
    split_type: str
    splits: List[SplitDetail]
    date: str
    created_at: str

class SettlementCreate(BaseModel):
    group_id: str
    from_user: str
    to_user: str
    amount: float

class SettlementResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    group_id: str
    from_user: str
    from_user_name: str
    to_user: str
    to_user_name: str
    amount: float
    created_at: str

class Balance(BaseModel):
    user_id: str
    user_name: str
    amount: float  # positive = owed to you, negative = you owe

class AddMemberRequest(BaseModel):
    email: EmailStr

# ==================== HELPER FUNCTIONS ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc).timestamp() + 86400 * 7  # 7 days
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register", response_model=dict)
async def register(user: UserCreate):
    # Check if user exists
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    user_doc = {
        "id": user_id,
        "email": user.email,
        "password": hash_password(user.password),
        "name": user.name,
        "created_at": now
    }
    
    await db.users.insert_one(user_doc)
    
    token = create_token(user_id, user.email)
    return {
        "token": token,
        "user": {
            "id": user_id,
            "email": user.email,
            "name": user.name,
            "created_at": now
        }
    }

@api_router.post("/auth/login", response_model=dict)
async def login(user: UserLogin):
    db_user = await db.users.find_one({"email": user.email})
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(db_user["id"], db_user["email"])
    return {
        "token": token,
        "user": {
            "id": db_user["id"],
            "email": db_user["email"],
            "name": db_user["name"],
            "created_at": db_user["created_at"]
        }
    }

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(**current_user)

# ==================== GROUPS ROUTES ====================

@api_router.post("/groups", response_model=GroupResponse)
async def create_group(group: GroupCreate, current_user: dict = Depends(get_current_user)):
    group_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    group_doc = {
        "id": group_id,
        "name": group.name,
        "description": group.description or "",
        "created_by": current_user["id"],
        "members": [
            {
                "user_id": current_user["id"],
                "name": current_user["name"],
                "email": current_user["email"]
            }
        ],
        "created_at": now
    }
    
    await db.groups.insert_one(group_doc)
    return GroupResponse(**group_doc)

@api_router.get("/groups", response_model=List[GroupResponse])
async def list_groups(current_user: dict = Depends(get_current_user)):
    groups = await db.groups.find(
        {"members.user_id": current_user["id"]},
        {"_id": 0}
    ).to_list(100)
    return [GroupResponse(**g) for g in groups]

@api_router.get("/groups/{group_id}", response_model=GroupResponse)
async def get_group(group_id: str, current_user: dict = Depends(get_current_user)):
    group = await db.groups.find_one(
        {"id": group_id, "members.user_id": current_user["id"]},
        {"_id": 0}
    )
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    return GroupResponse(**group)

@api_router.put("/groups/{group_id}", response_model=GroupResponse)
async def update_group(group_id: str, update: GroupUpdate, current_user: dict = Depends(get_current_user)):
    group = await db.groups.find_one({"id": group_id, "members.user_id": current_user["id"]})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    if update_data:
        await db.groups.update_one({"id": group_id}, {"$set": update_data})
    
    updated = await db.groups.find_one({"id": group_id}, {"_id": 0})
    return GroupResponse(**updated)

@api_router.delete("/groups/{group_id}")
async def delete_group(group_id: str, current_user: dict = Depends(get_current_user)):
    group = await db.groups.find_one({"id": group_id, "created_by": current_user["id"]})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found or you're not the owner")
    
    await db.groups.delete_one({"id": group_id})
    await db.expenses.delete_many({"group_id": group_id})
    await db.settlements.delete_many({"group_id": group_id})
    
    return {"message": "Group deleted"}

@api_router.post("/groups/{group_id}/members", response_model=GroupResponse)
async def add_member(group_id: str, request: AddMemberRequest, current_user: dict = Depends(get_current_user)):
    group = await db.groups.find_one({"id": group_id, "members.user_id": current_user["id"]})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    # Find user by email
    user = await db.users.find_one({"email": request.email}, {"_id": 0, "password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if already a member
    if any(m["user_id"] == user["id"] for m in group["members"]):
        raise HTTPException(status_code=400, detail="User is already a member")
    
    new_member = {
        "user_id": user["id"],
        "name": user["name"],
        "email": user["email"]
    }
    
    await db.groups.update_one(
        {"id": group_id},
        {"$push": {"members": new_member}}
    )
    
    updated = await db.groups.find_one({"id": group_id}, {"_id": 0})
    return GroupResponse(**updated)

@api_router.delete("/groups/{group_id}/members/{user_id}")
async def remove_member(group_id: str, user_id: str, current_user: dict = Depends(get_current_user)):
    group = await db.groups.find_one({"id": group_id, "members.user_id": current_user["id"]})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    if group["created_by"] == user_id:
        raise HTTPException(status_code=400, detail="Cannot remove group owner")
    
    await db.groups.update_one(
        {"id": group_id},
        {"$pull": {"members": {"user_id": user_id}}}
    )
    
    return {"message": "Member removed"}

# ==================== EXPENSES ROUTES ====================

@api_router.post("/expenses", response_model=ExpenseResponse)
async def create_expense(expense: ExpenseCreate, current_user: dict = Depends(get_current_user)):
    # Verify group access
    group = await db.groups.find_one(
        {"id": expense.group_id, "members.user_id": current_user["id"]},
        {"_id": 0}
    )
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    # Get payer name
    payer = next((m for m in group["members"] if m["user_id"] == expense.paid_by), None)
    if not payer:
        raise HTTPException(status_code=400, detail="Payer not in group")
    
    expense_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    expense_doc = {
        "id": expense_id,
        "group_id": expense.group_id,
        "description": expense.description,
        "amount": expense.amount,
        "paid_by": expense.paid_by,
        "paid_by_name": payer["name"],
        "split_type": expense.split_type,
        "splits": [s.model_dump() for s in expense.splits],
        "date": expense.date or now[:10],
        "created_at": now
    }
    
    await db.expenses.insert_one(expense_doc)
    return ExpenseResponse(**expense_doc)

@api_router.get("/expenses", response_model=List[ExpenseResponse])
async def list_expenses(group_id: str, current_user: dict = Depends(get_current_user)):
    # Verify group access
    group = await db.groups.find_one({"id": group_id, "members.user_id": current_user["id"]})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    expenses = await db.expenses.find(
        {"group_id": group_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(500)
    
    return [ExpenseResponse(**e) for e in expenses]

@api_router.put("/expenses/{expense_id}", response_model=ExpenseResponse)
async def update_expense(expense_id: str, update: ExpenseUpdate, current_user: dict = Depends(get_current_user)):
    expense = await db.expenses.find_one({"id": expense_id})
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    # Verify group access
    group = await db.groups.find_one({"id": expense["group_id"], "members.user_id": current_user["id"]})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    update_data = {}
    for k, v in update.model_dump().items():
        if v is not None:
            if k == "splits":
                update_data[k] = [s.model_dump() if hasattr(s, 'model_dump') else s for s in v]
            else:
                update_data[k] = v
    
    # Update paid_by_name if paid_by changed
    if "paid_by" in update_data:
        payer = next((m for m in group["members"] if m["user_id"] == update_data["paid_by"]), None)
        if payer:
            update_data["paid_by_name"] = payer["name"]
    
    if update_data:
        await db.expenses.update_one({"id": expense_id}, {"$set": update_data})
    
    updated = await db.expenses.find_one({"id": expense_id}, {"_id": 0})
    return ExpenseResponse(**updated)

@api_router.delete("/expenses/{expense_id}")
async def delete_expense(expense_id: str, current_user: dict = Depends(get_current_user)):
    expense = await db.expenses.find_one({"id": expense_id})
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    # Verify group access
    group = await db.groups.find_one({"id": expense["group_id"], "members.user_id": current_user["id"]})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    await db.expenses.delete_one({"id": expense_id})
    return {"message": "Expense deleted"}

# ==================== SETTLEMENTS ROUTES ====================

@api_router.post("/settlements", response_model=SettlementResponse)
async def create_settlement(settlement: SettlementCreate, current_user: dict = Depends(get_current_user)):
    # Verify group access
    group = await db.groups.find_one(
        {"id": settlement.group_id, "members.user_id": current_user["id"]},
        {"_id": 0}
    )
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    from_user = next((m for m in group["members"] if m["user_id"] == settlement.from_user), None)
    to_user = next((m for m in group["members"] if m["user_id"] == settlement.to_user), None)
    
    if not from_user or not to_user:
        raise HTTPException(status_code=400, detail="Users not in group")
    
    settlement_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    settlement_doc = {
        "id": settlement_id,
        "group_id": settlement.group_id,
        "from_user": settlement.from_user,
        "from_user_name": from_user["name"],
        "to_user": settlement.to_user,
        "to_user_name": to_user["name"],
        "amount": settlement.amount,
        "created_at": now
    }
    
    await db.settlements.insert_one(settlement_doc)
    return SettlementResponse(**settlement_doc)

@api_router.get("/settlements", response_model=List[SettlementResponse])
async def list_settlements(group_id: str, current_user: dict = Depends(get_current_user)):
    # Verify group access
    group = await db.groups.find_one({"id": group_id, "members.user_id": current_user["id"]})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    settlements = await db.settlements.find(
        {"group_id": group_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(500)
    
    return [SettlementResponse(**s) for s in settlements]

# ==================== BALANCES ROUTE ====================

@api_router.get("/groups/{group_id}/balances", response_model=List[Balance])
async def get_balances(group_id: str, current_user: dict = Depends(get_current_user)):
    # Verify group access
    group = await db.groups.find_one(
        {"id": group_id, "members.user_id": current_user["id"]},
        {"_id": 0}
    )
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    # Initialize balances for current user
    balances: Dict[str, float] = {}
    member_names: Dict[str, str] = {}
    
    for member in group["members"]:
        if member["user_id"] != current_user["id"]:
            balances[member["user_id"]] = 0.0
            member_names[member["user_id"]] = member["name"]
    
    # Get all expenses
    expenses = await db.expenses.find({"group_id": group_id}, {"_id": 0}).to_list(1000)
    
    for expense in expenses:
        paid_by = expense["paid_by"]
        splits = expense["splits"]
        
        for split in splits:
            user_id = split["user_id"]
            amount = split["amount"]
            
            if paid_by == current_user["id"] and user_id != current_user["id"]:
                # I paid, others owe me
                balances[user_id] = balances.get(user_id, 0) + amount
            elif paid_by != current_user["id"] and user_id == current_user["id"]:
                # Others paid, I owe them
                balances[paid_by] = balances.get(paid_by, 0) - amount
    
    # Get all settlements
    settlements = await db.settlements.find({"group_id": group_id}, {"_id": 0}).to_list(1000)
    
    for settlement in settlements:
        from_user = settlement["from_user"]
        to_user = settlement["to_user"]
        amount = settlement["amount"]
        
        if from_user == current_user["id"]:
            # I paid someone
            balances[to_user] = balances.get(to_user, 0) + amount
        elif to_user == current_user["id"]:
            # Someone paid me
            balances[from_user] = balances.get(from_user, 0) - amount
    
    result = []
    for user_id, amount in balances.items():
        if abs(amount) > 0.01:  # Only include non-zero balances
            result.append(Balance(
                user_id=user_id,
                user_name=member_names.get(user_id, "Unknown"),
                amount=round(amount, 2)
            ))
    
    return result

# ==================== DASHBOARD ROUTE ====================

@api_router.get("/dashboard")
async def get_dashboard(current_user: dict = Depends(get_current_user)):
    # Get all user's groups
    groups = await db.groups.find(
        {"members.user_id": current_user["id"]},
        {"_id": 0}
    ).to_list(100)
    
    total_owed = 0.0  # Money owed to me
    total_owing = 0.0  # Money I owe
    recent_expenses = []
    
    for group in groups:
        # Calculate balances for this group
        expenses = await db.expenses.find({"group_id": group["id"]}, {"_id": 0}).to_list(1000)
        settlements = await db.settlements.find({"group_id": group["id"]}, {"_id": 0}).to_list(1000)
        
        for expense in expenses:
            paid_by = expense["paid_by"]
            splits = expense["splits"]
            
            for split in splits:
                user_id = split["user_id"]
                amount = split["amount"]
                
                if paid_by == current_user["id"] and user_id != current_user["id"]:
                    total_owed += amount
                elif paid_by != current_user["id"] and user_id == current_user["id"]:
                    total_owing += amount
        
        for settlement in settlements:
            from_user = settlement["from_user"]
            to_user = settlement["to_user"]
            amount = settlement["amount"]
            
            if from_user == current_user["id"]:
                total_owing -= amount
            elif to_user == current_user["id"]:
                total_owed -= amount
    
    # Get recent expenses across all groups
    user_group_ids = [g["id"] for g in groups]
    if user_group_ids:
        recent = await db.expenses.find(
            {"group_id": {"$in": user_group_ids}},
            {"_id": 0}
        ).sort("created_at", -1).limit(10).to_list(10)
        
        for exp in recent:
            group = next((g for g in groups if g["id"] == exp["group_id"]), None)
            exp["group_name"] = group["name"] if group else "Unknown"
            recent_expenses.append(exp)
    
    return {
        "total_owed": round(max(0, total_owed - total_owing), 2),
        "total_owing": round(max(0, total_owing - total_owed), 2),
        "net_balance": round(total_owed - total_owing, 2),
        "groups_count": len(groups),
        "recent_expenses": recent_expenses
    }

# ==================== STATUS ROUTES ====================

@api_router.get("/")
async def root():
    return {"message": "SplitSync API is running"}

@api_router.get("/health")
async def health():
    return {"status": "healthy"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
