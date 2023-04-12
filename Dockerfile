FROM nginx:latest

COPY dist /usr/share/nginx/html
COPY default.conf /etc/nginx/conf.d

EXPOSE 80

ENV LANG C.UTF-8
RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
RUN echo 'Asia/Shanghai' >/etc/timezone

