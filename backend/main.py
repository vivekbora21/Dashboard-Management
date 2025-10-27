from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.database import engine
from routers.plans_router import router as plans_router
import models
import routers.kpis as kpis
import routers.profiles as profiles
import routers.plans as plans
import routers.products as products
import routers.statistics as statistics
import routers.user as user
import routers.forgot_credential as forgot_credential

app = FastAPI(title="Sales Manager API")

app.include_router(statistics.router)
app.include_router(plans_router)
app.include_router(kpis.router)
app.include_router(profiles.router)
app.include_router(plans.router)
app.include_router(products.router)
app.include_router(user.router)
app.include_router(forgot_credential.router)

models.Base.metadata.create_all(bind=engine)

origins = ["http://localhost:3001","http://127.0.0.1:3001"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
