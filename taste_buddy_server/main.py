#!.venv/bin/python
# -*- coding: utf-8 -*-
import argparse
import asyncio
import sys
import traceback

from pipeline.recipe_pipeline import run_pipeline_from_file
from server.app import start_server


def main():
    # Parse the command line arguments
    parser = argparse.ArgumentParser(description=f"Taste Buddy CLI")
    parser.add_argument(
        "-f",
        "--file",
        help="Run the recipe pipeline with the URLs in the specified file",
        required=False,
    )
    parser.add_argument(
        "-s", "--server", help="Run the server", action="store_true", required=False
    )
    parser.add_argument(
        "-d", "--debug", help="Debug mode", action="store_true", required=False
    )

    try:
        args = parser.parse_args()

        if args.server:
            # Start the server
            start_server(reload=args.debug)
        elif args.file:
            asyncio.run(run_pipeline_from_file(args.file))
        else:
            parser.print_help()

    except argparse.ArgumentError as e:
        print(
            f"An error occurred while parsing the command line arguments: {str(e)}",
            file=sys.stderr,
        )
    except Exception as e:
        tb = traceback.format_exc()
        print(f"An error occurred: {str(e)}", file=sys.stderr)
        print(tb, file=sys.stderr)


if __name__ == "__main__":
    main()
