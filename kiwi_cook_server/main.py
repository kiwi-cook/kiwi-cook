#!/usr/bin/env poetry run python
# -*- coding: utf-8 -*-

from api.app import APIServer


def main():
    APIServer().start()


if __name__ == "__main__":
    main()
