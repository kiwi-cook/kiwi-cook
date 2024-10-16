#!/usr/bin/env poetry run python
# -*- coding: utf-8 -*-
import argparse
import asyncio
import sys
import traceback


def main():
    # Parse the command line arguments
    parser = argparse.ArgumentParser(description=f"KiwiCook CLI")
    parser.add_argument(
        "--url",
        help="Run the recipe pipeline with the URLs in the specified file",
        required=False,
    )
    parser.add_argument(
        "--json",
        help="Run the recipe pipeline with a path to a folder containing JSON files",
        required=False,
    )
    parser.add_argument(
        "-s", "--server", help="Run the server", action="store_true", required=False
    )

    try:
        args = parser.parse_args()

        if args.server:
            from server.app import start_server
            start_server()
        elif args.url:
            from lib.pipeline.recipe import run_html_pipeline_from_path

            asyncio.run(run_html_pipeline_from_path(args.file))
        elif args.json:
            from lib.pipeline.recipe import run_json_pipeline

            asyncio.run(run_json_pipeline(args.json))
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
