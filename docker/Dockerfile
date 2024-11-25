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
