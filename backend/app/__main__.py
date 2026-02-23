from fastapi.responses import StreamingResponse
from netschoolapi import NetSchoolAPI
from typing import Any
from fastapi import FastAPI, Request
from datetime import datetime
from contextlib import asynccontextmanager
from io import BytesIO

from app.diary import connect_and_login


@asynccontextmanager
async def lifespan(app: FastAPI):
    ns = await connect_and_login()
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
    ns: NetSchoolAPI = request.app.state.ns
    return await ns.diary_delta()


@app.get("/diary/{delta}")
async def get_diary(request: Request, delta: int):
    ns: NetSchoolAPI = request.app.state.ns
    return await ns.diary_delta(delta)


@app.get("/homework/{assignment_id}")
async def get_homework(request: Request, assignment_id: int):
    ns: NetSchoolAPI = request.app.state.ns
    attachments = await ns.assignments(assignment_id)
    return attachments


@app.get("/file/{attachment_id}")
async def get_file(request: Request, attachment_id: int, filename: str | None = None):
    ns: NetSchoolAPI = request.app.state.ns

    buffer = BytesIO()
    file = await ns.download_attachment(attachment_id, buffer)
    buffer.seek(0)

    if not filename:
        filename = f"attachment_{attachment_id}"

    return StreamingResponse(
        buffer,
        media_type="application/octet-stream",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )
