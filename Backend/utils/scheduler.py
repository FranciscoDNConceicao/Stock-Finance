"""Keeps prices and news up to date by running the loaders on a schedule.

    cd Backend/utils
    python scheduler.py            # run forever on the schedule below
    python scheduler.py --now      # also run every job once right away
    python scheduler.py --once stocks   # run one job and exit (stocks | news)

Schedules are cron expressions (minute hour day month weekday) and can be
changed with environment variables. Write weekdays as names (mon, tue-sat):
APScheduler numbers them from Monday=0, unlike classic cron.

    SCHEDULER_TIMEZONE     default UTC
    SCHEDULER_STOCKS_CRON  default "0 6 * * tue-sat"  (06:00, after each US trading day)
    SCHEDULER_NEWS_CRON    default "0 7 * * *"    (daily 07:00; takes ~1h30 on Polygon's free plan)
    SCHEDULER_RUN_ON_START default false          (same as --now)

Runs as its own process (the `scheduler` service in docker-compose.yml), so
the API can scale to several workers without each one running the jobs.
"""

import argparse
import logging
import os
import sys

import NewsDataToDatabase
import StockToCompany
from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.cron import CronTrigger

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger("scheduler")

JOBS = {
    # name: (function, env var with the cron expression, default cron)
    "stocks": (StockToCompany.main, "SCHEDULER_STOCKS_CRON", "0 6 * * tue-sat"),
    "news": (NewsDataToDatabase.main, "SCHEDULER_NEWS_CRON", "0 7 * * *"),
}


def run(name):
    logger.info("Job %s started", name)
    try:
        JOBS[name][0]()
    except Exception:
        # Log and keep the scheduler alive; the next run will try again
        logger.exception("Job %s failed", name)
        return False
    logger.info("Job %s finished", name)
    return True


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--now", action="store_true", help="run every job once at start-up")
    parser.add_argument("--once", choices=JOBS, help="run a single job and exit")
    args = parser.parse_args()

    if args.once:
        sys.exit(0 if run(args.once) else 1)

    timezone = os.environ.get("SCHEDULER_TIMEZONE", "UTC")
    scheduler = BlockingScheduler(timezone=timezone)
    for name, (_, env_var, default) in JOBS.items():
        cron = os.environ.get(env_var, default)
        scheduler.add_job(
            run,
            CronTrigger.from_crontab(cron, timezone=timezone),
            args=[name],
            id=name,
            # Never two copies of a job at once; after downtime run a missed job once
            max_instances=1,
            coalesce=True,
            misfire_grace_time=3600,
        )
        logger.info("Scheduled %s: '%s' (%s)", name, cron, timezone)

    if args.now or os.environ.get("SCHEDULER_RUN_ON_START", "").lower() in ("1", "true", "yes"):
        for name in JOBS:
            scheduler.add_job(run, args=[name], id=f"{name}-startup", max_instances=1)

    try:
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        logger.info("Scheduler stopped")


if __name__ == "__main__":
    main()
