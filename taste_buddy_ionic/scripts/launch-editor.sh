#!/bin/bash

#
# Copyright (c) 2023 Josef Müller.
#

# Start the npm server detached
npmserver=npm run serve:editor &

# Start the python development server
cd ../server-dev && ./scripts/launch-server.sh
