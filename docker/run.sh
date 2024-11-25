#!/bin/bash

docker run --rm -it --name mlc-llm -v $(pwd)/data:/data  --gpus all onceuponai/mlc-llm
