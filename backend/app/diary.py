from datetime import timedelta, date
from netschoolapi.schemas import Diary, Day
import asyncio
from netschoolapi import NetSchoolAPI
from dotenv import load_dotenv
from app import URL, LOGIN, PASSWORD, SCHOOL_NAME_OR_ID


async def connect_and_login() -> NetSchoolAPI:
    load_dotenv()
    ns = NetSchoolAPI(URL)

    await ns.login(
        LOGIN,
        PASSWORD,
        SCHOOL_NAME_OR_ID,
        requests_timeout=5,
    )
    return ns
