from typing import Any
from fastapi import FastAPI, Request
from datetime import datetime
from contextlib import asynccontextmanager

from app.diary import connect_and_login


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("logging")
    ns = await connect_and_login()
    print("ura")
    app.state.ns = ns
    yield
    ns.logout()


app = FastAPI(title="NetSchool Diary", version="1.0.0", lifespan=lifespan)


@app.get("/")
async def root() -> dict[str, Any]:
    return {
        "status": "ok",
        "service": "netschool-diary",
        "version": app.version,
        "timestamp": datetime.now(),
    }


@app.get("/diary")
async def get_diary(request: Request):
    ns = request.app.state.ns
    return await ns.diary_delta()


@app.get("/diary/{delta}")
async def get_diary(request: Request, delta: int):
    ns = request.app.state.ns
    return await ns.diary_delta(delta)


@app.get("/homework/{assignment_id}")
async def get_homework(request: Request, assignment_id: int):
    ns = request.app.state.ns
    attachments = await ns.assignments(assignment_id)
    return attachments


@app.get("/file/{file_id}")
async def get_file(request: Request, file_id: int):
    ns = request.app.state.ns
    file = await ns.download_attachment(file_id)
    return file
