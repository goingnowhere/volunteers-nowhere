FROM pietropietro/alpine-meteor:latest
RUN apk add --no-cache paxctl && paxctl -cm `which node` && apk del --no-cache paxctl
