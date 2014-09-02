
FROM ubuntu:latest
MAINTAINER Alvin Lazaro <me@alvinl.com>
RUN apt-get update && apt-get install -y curl man git build-essential python

USER root
ENV HOME /home/app
ENV NODE_VER v0.10

RUN git clone https://github.com/creationix/nvm.git $HOME/.nvm
RUN groupadd -r app -g 433 && useradd -r -g app -d /home/app app && chown -R app:app /home/app
USER app

RUN echo '. ~/.nvm/nvm.sh' >> $HOME/.profile
RUN echo 'echo "$(tput setaf 2)-----> Installing Node v${NODE_VER}$(tput sgr0)"' >> $HOME/.profile
RUN echo 'nvm install ${NODE_VER}' >> $HOME/.profile
RUN echo 'nvm alias default ${NODE_VER}' >> $HOME/.profile
RUN echo 'if [ -d "$HOME/deploy" ]; then echo "$(tput setaf 2)-----> Pulling repository - ${APP_REPO}$(tput sgr0)"' >> $HOME/.profile
RUN echo 'cd $HOME/deploy; git pull --rebase \nfi' >> $HOME/.profile
RUN echo 'if [ ! -d "$HOME/deploy" ]; then echo "$(tput setaf 2)-----> Cloning repository - ${APP_REPO}$(tput sgr0)"' >> $HOME/.profile
RUN echo 'git clone ${APP_REPO} $HOME/deploy \nfi' >> $HOME/.profile
RUN echo 'echo "$(tput setaf 2)-----> Installing dependencies$(tput sgr0)"' >> $HOME/.profile
RUN echo 'cd $HOME/deploy; npm install' >> $HOME/.profile
RUN echo 'echo "$(tput setaf 2)-----> Launching app$(tput sgr0)"' >> $HOME/.profile

ENTRYPOINT ["/bin/bash", "--login", "-i", "-c", "cd $HOME/deploy; npm start"]
