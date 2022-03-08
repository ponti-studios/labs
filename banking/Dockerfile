FROM python:3.6.9

WORKDIR /usr/src/app

COPY ./requirements.txt ./

RUN apt-get install gcc
RUN pip install -r requirements.txt

RUN pip install dumb-init

COPY ./ ./

CMD [ "dumb-init", "python", "-m", "misc" ]