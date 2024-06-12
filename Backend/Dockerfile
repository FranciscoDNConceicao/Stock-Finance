#Use the official Python image with Python3.12 as the base image
FROM python:3.12

#Set the working directory inside the container app
WORKDIR /app

#Copy the requirements.txt file from the local directory to the working directory
COPY requirements.txt .

ENV PYTHONPATH="/:$PYTHONPATH"

#Install the python dependencies specifuied in requirement.txt
RUN pip install --no-cache-dir --upgrade -r requirements.txt

#Copy the app directory
COPY ./app /app

#Add contents root to PYTHONPATH
CMD ["export", "PYTHONPATH=$PWD"]

#Set the command to run the application using uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]