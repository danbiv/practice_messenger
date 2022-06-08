from hashlib import new
import string
import random
from datetime import date, datetime, timedelta
from flask import Flask, json, render_template, request, jsonify, flash,redirect, url_for, session
from functools import wraps
 
from flask.globals import session

# pip install sqlescapy
import re

# connect to mysql
import mysql.connector # pip3 install mysql-connector
import bcrypt
import configparser
import io

app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

#From secrets.cfg
config = configparser.ConfigParser()
config.read('mysecrets.cfg')
DB_NAME = 'test'
DB_USERNAME = config['secrets']['DB_USERNAME']
DB_PASSWORD = config['secrets']['DB_PASSWORD']
PEPPER = config['secrets']['PEPPER']

#For quick validation of login
tokens = {}

last_read={}

def track_time(st,ct):
  user = ''
  for key in tokens:
    if tokens[key] == st:
      user = key
      break

  try:
    last_read[user]
  except:
    last_read[user]= {ct : ''}      
  
  last_read[user][ct] = datetime.utcnow()

def start_tracking(user):

  # First querey for list of channels
  connection = mysql.connector.connect(user=DB_USERNAME, database=DB_NAME, password=DB_PASSWORD)
  cursor = connection.cursor()

  # GETS all channels and respective authors
  query = "SELECT title FROM channels"

  try:
    cursor.execute(query)

    results = cursor.fetchall()

    # [('random_messages',), ('test',), ('test2',), ('test3',), ('done',), ('newchat',), ('again',), ('onetime',)]
    for result in results:
      print(result[0])
      last_read[user] = {result[0] : ''}
      last_read[user][result[0]] = datetime.utcnow()

      return True
  
  except Exception as e:
    print(e)    
    return False

  finally:
    cursor.close()
    connection.close()
  

def get_allbeforetrack(user):
  # DELETE FROM table WHERE date < '2011-09-21 08:21:22';

  # First querey for list of channels
  connection = mysql.connector.connect(user=DB_USERNAME, database=DB_NAME, password=DB_PASSWORD)
  cursor = connection.cursor()

  # GETS all channels and respective authors
  query = "SELECT title FROM channels"

  try:
    cursor.execute(query)

    results = cursor.fetchall()

    counted = {}

    # [('random_messages',), ('test',), ('test2',), ('test3',), ('done',), ('newchat',), ('again',), ('onetime',)]
    for result in results:
      try:
        # select timemade from random_messages where timemade>'2021-08-28';
        count_query = 'SELECT timemade FROM '+result[0]+' WHERE timemade > "'+str(last_read[user][result[0]])+'"'
        cursor.execute(count_query)

        ans = cursor.fetchall()
        counted[result[0]] = str(len(ans))
       

      except:
        counted[result[0]] = str('0')
        

    return counted

  except Exception as e:
    print(e)    
    return False

  finally:
    cursor.close()
    connection.close()


def sanitize(x):
  # x = re.sub(']','\]',x)
  # x = re.sub('[','\[',x)
  # x = re.sub('_','\_',x)
  x = re.sub('%','\%',x)
  x = re.sub('"','\"',x)
  x = re.sub("'","\'",x)
  x = re.sub("<","&lt",x)
  x = re.sub(">","&gt",x)
  x= re.escape(x)
  return x

def addchat(title,author):
  
  # TODO: SANITIZE INPUTS HERE
  title = sanitize(title)
  author= sanitize(author)

  title = re.sub(" ","_",title)

  #Takes Chatname, User
  connection = mysql.connector.connect(user=DB_USERNAME, database=DB_NAME, password=DB_PASSWORD)
  cursor = connection.cursor()

  #Creates table, takes title as argument
  create_channel = "CREATE TABLE "+title+" (id INT AUTO_INCREMENT PRIMARY KEY, author VARCHAR(40), body TEXT, timemade datetime)"
  #Saves table info in channel list
  save_specs = "INSERT INTO channels (author, title) VALUES ('"+author+"','"+title+"')"

  try:
    cursor.execute(create_channel)
    connection.commit()

    cursor.execute(save_specs)
    connection.commit()

    return title

  except Exception as e:
    print(e)    
    return False

  finally:
    cursor.close()
    connection.close()


def addthread(mid,ct):

  mid = sanitize(mid)
  ct = sanitize(ct)
  
  #No sanitation necesary in this case rn
  
  # using select body from ct where id=mid;
  get_message = 'select * from '+ct+' where id='+ mid
 
  # create table called that ct_message
  # create_table = "CREATE TABLE "+title+" (id INT AUTO_INCREMENT PRIMARY KEY, author VARCHAR(40), body TEXT, timemade datetime)"
  # migrate (select * from ct where id=mied)

  #Takes Chatname, User
  connection = mysql.connector.connect(user=DB_USERNAME, database=DB_NAME, password=DB_PASSWORD)
  cursor = connection.cursor()

  #Creates table, takes title as argument
  # create_thread = "CREATE TABLE "+title+" (id INT AUTO_INCREMENT PRIMARY KEY, author VARCHAR(40), body TEXT, timemade datetime)"
  #Saves table info in channel list
  # save_specs = "INSERT INTO channels (author, title) VALUES ('"+author+"','"+title+"')"

  try:
    cursor.execute(get_message)
    omessage = []
    for x in cursor:
       # get message as array list
      omessage.append(x)
      print(omessage)

    # [(2, 'root', 'can you hear me?', datetime.datetime(2021, 8, 28, 5, 30, 58))]
    # create table called that message_mid_ct
    title = ct+"_"+mid
    print('title:',title)

    create_thread = "CREATE TABLE "+title+" (id INT AUTO_INCREMENT PRIMARY KEY, author VARCHAR(40), body TEXT, timemade datetime)"
    print(create_thread)
    cursor.execute(create_thread)
    connection.commit()

    # HAD TROUPBLE WITH TRANSFERING DATETIME COME BACK TO IT
    # dt = str(omessage[0][3])
    # print(dt)

    # INSERT INTO table2
    # SELECT * FROM table1
    # WHERE condition;
    
    insert_o = "INSERT INTO "+title+" "+get_message
    save_specs = "INSERT INTO threads (title, ochannel) VALUES ('"+title+"','"+ct+"')"

    cursor.execute(insert_o)
    connection.commit()

    cursor.execute(save_specs)
    connection.commit()

    return True

  except Exception as e:
    print(e)    
    return False

  finally:
    cursor.close()
    connection.close()




def deleteChat(title):
  title = sanitize(title)

  # delete from channels where title='title';

  connection = mysql.connector.connect(user=DB_USERNAME, database=DB_NAME, password=DB_PASSWORD)
  cursor = connection.cursor()

  #Deletes from channels
  channel_delete = "DELETE FROM channels WHERE title='" +title+ "'"
  table_delete = "DROP TABLE IF EXISTS "+title

  try:
    cursor.execute(channel_delete)
    connection.commit()

    cursor.execute(table_delete)
    connection.commit()

    return True

  except Exception as e:
    print(e)    
    return False

  finally:
    cursor.close()
    connection.close()
  
  
# Is functional based on sessions 
# The username session pair is meant to be overwritten
def saveUser(st, username):   
    tokens[username] = st


# ------------------------------ STATIC ROUTES ---------------------------------

# TODO: Include any other routes your app might send users to
@app.route('/')
@app.route('/chat/<chat_title>')
@app.route('/chat/<chat_title>/<int:thread_token>')
def index(chat_title=None,thread_token=None):
    return app.send_static_file('index.html')


# -------------------------------- API ROUTES ----------------------------------

#Signup Endboint - DONE
@app.route('/api/signup',methods=['POST'])
def signup():

    body = request.get_json()

    username = body['username']
    password = (body['password'] + PEPPER).encode('utf-8')

    connection = mysql.connector.connect(user=DB_USERNAME, database=DB_NAME, password=DB_PASSWORD)
    cursor = connection.cursor()

    hashed = bcrypt.hashpw(password, bcrypt.gensalt())

    query = "INSERT into users (username, password) VALUES (%s, %s)"

    session_token  = ''.join(random.choices(string.ascii_uppercase + string.digits, k=56))
    saveUser(session_token, username)
    start_tracking(username)

    try:
        cursor.execute(query, (username, hashed))
        connection.commit()

        return {'session_token': session_token}, 200 


    except Exception as e:
        print(e)
        return {"username": username}, 302
    finally:
        cursor.close()
        connection.close()


#Login Endpoint -DONE
@app.route('/api/login', methods=['POST'])
def login():
  body = request.get_json()

  username = body['username']
  password = (body['password'] + PEPPER).encode('utf-8')

  connection = mysql.connector.connect(user=DB_USERNAME, database=DB_NAME, password=DB_PASSWORD)
  cursor = connection.cursor()

  query = "SELECT password FROM users WHERE username=%s"

  try:
    cursor.execute(query, (username,))
    hashed = cursor.fetchone()[0].encode('utf-8')

    if bcrypt.checkpw(password, hashed):

      st  = ''.join(random.choices(string.ascii_uppercase + string.digits, k=56))
      saveUser(st,username)
      start_tracking(username)

      return {'session_token': st}, 200 #returns 200 and Token
    
    else:
      return {}, 404

  except Exception as e:
    print(e)
    return {}, 404
  finally:
    cursor.close()
    connection.close()



#Authenticate Endpoint - DONE
@app.route('/api/auth', methods=['POST'])
def auth():
  if request.method == 'POST':
    st = request.headers['session_token']
    exists = False

    for key in tokens: 
      if tokens[key] == st:
        exists = True
        break

    if exists:
      return {},200 #RETURNS 200 if token key pair recognized
    else:
      return {},404 #Otherwise no



#Create Channel - DONE
@app.route('/api/create', methods=['POST'])
def newChannel():

  if request.method == 'POST':
    st = request.headers['session_token']
    title = request.headers['title']
    author = ''

    for key in tokens: 
      if tokens[key] == st:
        author = key
        break
    
    x = addchat(title,author)

    if x:
      return {"chat_id": x},200
    else:
      return {},304

#Create Thread 
@app.route('/api/createThread', methods=['POST'])
def newThread():

  if request.method == 'POST':
    st = request.headers['session_token']
    mid = request.headers['message_id']
    ct = request.headers['chat_token']

    exists = False

    for key in tokens: 
      if tokens[key] == st:
        exists = True
        break

    if exists:
    
      x = addthread(mid,ct)

      if x:
        return {},200
      else:
        return {},304

@app.route('/api/channels',methods=['GET'])
def getChannels():

  if request.method == 'GET':

    # AUTHENTICATE ST:
    st = request.headers['session_token']
    exists = False

    for key in tokens: 
      if tokens[key] == st:
        exists = True
        break

    if exists:
      connection = mysql.connector.connect(user=DB_USERNAME, database=DB_NAME, password=DB_PASSWORD)
      cursor = connection.cursor()

      user = ''
      for key in tokens:
        if tokens[key] == st:
          user = key
          break
      x = get_allbeforetrack(user)

      # GETS all channels and respective authors
      query = "SELECT * FROM channels"

      try:
        cursor.execute(query)

        results = cursor.fetchall()
        # print(results)
        # print(x)

        return {"channels": results,"counts": x},200

      except Exception as e:
        print(e)    
        return {}, 404

      finally:
        cursor.close()
        connection.close()
    
    else:
      return {},404


#Method to get channel Messages and Send Messages of your own
@app.route('/api/messages', methods=['GET','POST'])
def allMessages():

  if request.method == 'POST':
    # TODO: USER STATUS CAN SEND, TRUE FALSE

    # Take from header
    st = request.headers['session_token']
    
    for key in tokens: 
      if tokens[key] == st:
        user = key
        break

    if user:
      ct = request.headers['chat_token']
      sendtime = str(datetime.utcnow())

      track_time(st,ct)

      body = request.get_json()
      mess = body['message']

      connection = mysql.connector.connect(user=DB_USERNAME, database=DB_NAME, password=DB_PASSWORD)
      cursor = connection.cursor()

      add_message = "INSERT into "+sanitize(ct)+" (author, body, timemade) values ('"+user+"','"+sanitize(mess)+"','"+sendtime+"')"

      try:
        cursor.execute(add_message)
        connection.commit()

        return {},200

      except Exception as e:
        print(e)    
        return {}, 404

      finally:
        cursor.close()
        connection.close()

    else:
      return {}, 404

  if request.method =='GET':
    # AUTHENTICATE ST:
    st = request.headers['session_token']
    exists = False

    for key in tokens: 
      if tokens[key] == st:
        exists = True
        break

    if exists:
      ct = request.headers['chat_token']
      track_time(st,ct)

      connection = mysql.connector.connect(user=DB_USERNAME, database=DB_NAME, password=DB_PASSWORD)
      cursor = connection.cursor()

      get_messages = "SELECT * FROM "+sanitize(ct)+";"

      try:
        cursor.execute(get_messages)

        results = cursor.fetchall()

        return {"messages": results}, 200


      except Exception as e:
        print(e)    
        return {}, 404

      finally:
        cursor.close()
        connection.close()

    #Method to get channel Messages and Send Messages of your own
@app.route('/api/replys', methods=['GET','POST'])
def allThreads():

  if request.method == 'POST':
    # TODO: USER STATUS CAN SEND, TRUE FALSE

    # Take from header
    st = request.headers['session_token']
    
    for key in tokens: 
      if tokens[key] == st:
        user = key
        break

    if user:
      ct = request.headers['chat_token']
      tt = request.headers['thread_token']
      title = ct+"_"+tt
      sendtime = str(datetime.utcnow())

      body = request.get_json()
      mess = body['message']

      connection = mysql.connector.connect(user=DB_USERNAME, database=DB_NAME, password=DB_PASSWORD)
      cursor = connection.cursor()

      add_message = "INSERT into "+sanitize(title)+" (author, body, timemade) values ('"+user+"','"+sanitize(mess)+"','"+sendtime+"')"

      try:
        cursor.execute(add_message)
        connection.commit()

        return {},200

      except Exception as e:
        print(e)    
        return {}, 404

      finally:
        cursor.close()
        connection.close()

    else:
      return {}, 404

  if request.method =='GET':
    # AUTHENTICATE ST:
    st = request.headers['session_token']

    for key in tokens: 
      if tokens[key] == st:
        user = key
        break

    if user:
      ct = request.headers['chat_token']
      tt = request.headers['thread_token']
      title= ct+"_"+tt
      
      track_time(st,title)

      connection = mysql.connector.connect(user=DB_USERNAME, database=DB_NAME, password=DB_PASSWORD)
      cursor = connection.cursor()

      get_messages = "SELECT * FROM "+sanitize(title)+";"

      try:
        cursor.execute(get_messages)

        results = cursor.fetchall()
        # print(results)
        return {"messages": results}, 200


      except Exception as e:
        print(e)    
        return {}, 404

      finally:
        cursor.close()
        connection.close()


#Get Counts w/o messages
@app.route('/api/unread', methods=['GET','POST'])
def getUnread():
  # print("loading counts")
  if request.method == 'GET':
    st = request.headers['session_token']

    for key in tokens: 
      if tokens[key] == st:
        user = key
        break

    x = get_allbeforetrack(user)
    # print(x)

    return {'channels_counts': x},200
    
    
