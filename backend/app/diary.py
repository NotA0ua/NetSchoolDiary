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


async def get_lessons(ns: NetSchoolAPI, diary: Diary) -> list[Day] | None:
    days = diary.schedule

    return days.sort(key=lambda d: d.day.day)


async def diary_delta(
    ns: NetSchoolAPI,
    delta: int = 0,
    requests_timeout: int | None = None,
) -> Diary:
    monday = date.today() - timedelta(days=(date.today().weekday()))
    start = monday + timedelta(days=delta * 7)
    end = start + timedelta(days=6)

    return await ns.diary(start, end, requests_timeout)


# async def get_diary():
#
#
#     await get_lessons(ns, diary)
#
#     await ns.logout()
