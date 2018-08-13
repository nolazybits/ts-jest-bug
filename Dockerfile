# multi stage docker file
FROM node:alpine

RUN apk update \
    && apk add \
        sudo \
        docker \
        'py-pip' \
        bash \
        vim \
        curl

# switch back to our user
# USER sauce

# instal the latest yarn version
RUN curl --compressed -o- -L https://yarnpkg.com/install.sh | bash

# add lerna (monorepo management),
# commitizen (formated commit so we can create nice release following semantic versioning)
RUN yarn config set workspaces-experimental true

# Create our application workdir
WORKDIR "/home/application"