# Thumbellama

[Youtube Full Story - "ThumbeLLama - pocket size LLM"](https://youtu.be/Cex6d4ZnmhY)
[WebApplication to test TinyLLama](https://stories.onceuponai.dev/stories-thumbellama/)

Tiny LLama is an ambitious initiative aimed at pretraining a language model on 
a dataset of 3 trillion tokens. What sets this project apart is not just 
the size of the data but the efficiency and speed of its processing. 
Utilizing 16 A100-40G GPUs, the training of Tiny LLama started in 
September and is planned to span just 90 days.

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
RUN python3 -m pip install --pre -U -f https://mlc.ai/wheels mlc-chat-nightly-cu122 mlc-ai-nightly-cu122

RUN apt install gcc
COPY --from=download /mlc-llm /opt/mlc-llm

RUN cd /opt/mlc-llm && pip3 install .

RUN apt-get install git-lfs -yq

ENV TVM_HOME="/opt/venv/lib/python3.10/site-packages/tvm/"

RUN git clone https://github.com/emscripten-core/emsdk.git --branch 3.1.50 --single-branch /opt/emsdk
RUN cd /opt/emsdk && ./emsdk install latest

ENV PATH="/opt/emsdk:/opt/emsdk/upstream/emscripten:/opt/emsdk/node/16.20.0_64bit/bin:/opt/venv/bin:$PATH"
RUN cd /opt/emsdk/ && ./emsdk activate latest
ENV TVM_HOME=/opt/mlc-llm/3rdparty/tvm

RUN cd /opt/mlc-llm/3rdparty/tvm \
  && git checkout 5828f1e9e \
  && git submodule init \
  && git submodule update --recursive \
  && make webclean \
  && make web


RUN python3 -m pip install auto_gptq>=0.2.0 transformers

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

To convert model to mlc-llm we need to run

```bash
python3 -m mlc_llm.build --hf-path TinyLlama/TinyLlama-1.1B-Chat-v0.6  --target webgpu --quantization q4f32_0 --use-safetensors
```

where ([Documentation](https://llm.mlc.ai/docs/compilation/compile_models.html)):
**hf-path** - is huggingface model name in this case [TinyLlama/TinyLlama-1.1B-Chat-v0.6](https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v0.6)
**target** - is platfrom for which we prepare the model
available options:
  * auto (will detect from cuda, metal, vulkan and opencl)
  * metal (for M1/M2)
  * metal_x86_64 (for Intel CPU)
  * iphone
  * vulkan 
  * cuda
  * webgpu
  * android
  * opencl

**quantization** - is quantization mode:
available options:
quantization: qAfB(_0)
	A - number of bits for weights
	B - number of bits for activations
available options:
	autogptq_llama_q4f16_0,	autogptq_llama_q4f16_1,
	q0f16, q0f32, 
	q3f16_0, q3f16_1, 
	q4f16_0, q4f16_1, q4f16_2, q4f16_ft, q4f32_0, q4f32_1
	q8f16_ft, q8f16_1

In our case we will use **webgpu** target and **q4f32_0** quantization to obtaind wasm file and converted model.
I have shared several converted models on [HuggingFace](https://huggingface.co/onceuponai-dev) and 
[Github](https://github.com/onceuponai-dev/stories-thumbellama/tree/main/public/binary-mlc-llm-libs).

Read more on:
[https://blog.qooba.net/2023/12/13/tinyllama-compact-llm-with-webassembly/](https://blog.qooba.net/2023/12/13/tinyllama-compact-llm-with-webassembly/)



For bielik
```
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
