# [Bielik](https://huggingface.co/speakleash) in Web Assembly 

This repository show how to run Bielik models from [https://speakleash.org/](https://speakleash.org/) in Web Assembly.

You can talk with them directly in your browser [https://blog.qooba.net/bielik-in-wasm/](https://blog.qooba.net/bielik-in-wasm/).

Remember that model will be downloaded and run in your browser.

## Environment

For ease, I've prepared a Docker image containing all the necessary tools, including CUDA, mlc-llm, 
and Emscripten, which are crucial for preparing the model for WebAssembly.

Dockerfile:
 ```
 FROM alpine/git:2.36.2 as download
RUN git clone https://github.com/mlc-ai/mlc-llm.git --recursive /mlc-llm

FROM nvidia/cuda:12.2.2-cudnn8-devel-ubuntu22.04

RUN apt update && \
    apt install -yq curl git cmake ack tmux \
        python3-dev vim python3-venv python3-pip \
        protobuf-compiler build-essential

RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN python3 -m pip install --pre -U -f https://mlc.ai/wheels mlc-llm-nightly-cu122 mlc-ai-nightly-cu122

RUN apt install gcc
COPY --from=download /mlc-llm /opt/mlc-llm

#RUN cd /opt/mlc-llm && pip3 install .

RUN apt-get install git-lfs -yq

ENV TVM_HOME="/opt/venv/lib/python3.10/site-packages/tvm/"

RUN git clone https://github.com/emscripten-core/emsdk.git --branch 3.1.50 --single-branch /opt/emsdk
RUN cd /opt/emsdk && ./emsdk install latest

ENV PATH="/opt/emsdk:/opt/emsdk/upstream/emscripten:/opt/emsdk/node/16.20.0_64bit/bin:/opt/venv/bin:$PATH"
RUN cd /opt/emsdk/ && ./emsdk activate latest
ENV TVM_HOME=/opt/mlc-llm/3rdparty/tvm

RUN cd /opt/mlc-llm/3rdparty/tvm \
  && git submodule init \
  && git submodule update --recursive \
  && make webclean \
  && make web

RUN cd /opt/mlc-llm && ./web/prep_emcc_deps.sh
ENV TVM_SOURCE_DIR=/opt/mlc-llm/3rdparty/tvm
ENV MLC_LLM_SOURCE_DIR=/opt/mlc-llm

 #&& git checkout 5828f1e9e \

#RUN python3 -m pip install auto_gptq>=0.2.0 transformers


CMD /bin/bash

 ```

To build docker image we need to run:
```bash
docker build -t onceuponai/mlc-llm .
```

To run container:
```bash
docker run --rm -it --name mlc-llm -v $(pwd)/data:/data --gpus all onceuponai/mlc-llm
```

## MLC-LLM

To convert model to mlc-llm we need to run additional commands.

### Bielik-11B-v2.3-Instruct

```bash
git clone https://huggingface.co/speakleash/Bielik-11B-v2.3-Instruct
cd ../..

mlc_llm convert_weight ./dist/models/Bielik-11B-v2.3-Instruct --quantization q4f32_1 \
    -o dist/Bielik-11B-v2.3-Instruct-q4f32_1-MLC
    
mkdir dist/libs

mlc_llm gen_config ./dist/models/Bielik-11B-v2.3-Instruct/ --quantization q4f32_1 \
    --prefill-chunk-size 1024 --conv-template mistral_default \
    -o dist/Bielik-11B-v2.3-Instruct-q4f32_1-MLC/
    
    
mlc_llm compile ./dist/Bielik-11B-v2.3-Instruct-q4f32_1-MLC/mlc-chat-config.json \
    --device webgpu -o dist/libs/Bielik-11B-v2.3-Instruct-q4f32_1-webgpu.wasm
```

### Bielik-7B-Instruct-v0.1

```bash
git clone https://huggingface.co/speakleash/Bielik-7B-Instruct-v0.1

mlc_llm convert_weight ./dist/models/Bielik-7B-Instruct-v0.1 --quantization q4f32_1 \
    -o dist/Bielik-7B-Instruct-v0.1-q4f32_1-MLC
    
mkdir dist/libs

mlc_llm gen_config ./dist/models/Bielik-7B-Instruct-v0.1/ --quantization q4f32_1 \
    --prefill-chunk-size 1024 --conv-template mistral_default \
    -o dist/Bielik-7B-Instruct-v0.1-q4f32_1-MLC/
    
    
mlc_llm compile ./dist/Bielik-7B-Instruct-v0.1-q4f32_1-MLC/mlc-chat-config.json \
    --device webgpu -o dist/libs/Bielik-7B-Instruct-v0.1-q4f32_1-webgpu.wasm
```