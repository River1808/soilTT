from flask import Flask, render_template, request, redirect, url_for, session
from flask_mysqldb import MySQL
import MySQLdb.cursors
import re

#initialize flask function
app = Flask(__name__)
 
app.secret_key = '123456789'
 
app.config['MYSQL_HOST'] = '127.0.0.1'
app.config['MYSQL_PORT'] = 3306
app.config['MYSQL_USER'] = 'name1'
app.config['MYSQL_PASSWORD'] = '123456'
app.config['MYSQL_DB'] = 'login_sys'
 
mysql = MySQL(app)
   

#registration
@app.route('/register_page.html', methods=['POST', 'GET'])
def register_page():
    msg = ''
    if request.method == 'POST' and 'username' in request.form and 'password' in request.form and 'email' in request.form :
        username = request.form['username']
        password = request.form['password']
        email = request.form['email']
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('SELECT * FROM accounts WHERE username = % s', (username, ))
        account = cursor.fetchone()
        if account:
            msg = 'Account already exists!'
        elif not re.match(r'[^@]+@[^@]+\.[^@]+', email):
            msg = 'Invalid email address !'
        elif not re.match(r'[A-Za-z0-9]+', username):
            msg = 'Username must contain only characters and numbers!'
        elif not username or not password or not email:
            msg = 'Please fill out the form!'
        else:
            cursor.execute('INSERT INTO accounts VALUES (NULL, % s, % s, % s)', (username, email, password))
            mysql.connection.commit()
            print('User registered successfully')
            msg = 'You have successfully registered !'
    elif request.method == 'POST':
        msg = 'Please fill out the form !'
    return render_template('register_page.html', msg = msg)
@app.route("/home_page", methods=['POST', 'GET'])
def home_page():
    return render_template("home_page.html")

@app.route('/test_db')
def test_db():
    try:
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('SELECT * FROM accounts')
        accounts = cursor.fetchall()
        if not accounts:
            return "No data found in the accounts table."
        return render_template('test_db.html', accounts=accounts)
    except MySQLdb.Error as e:
        return f"Error reading from MySQL Database: {e}"
    

#login
@app.route("/", methods = ['GET', 'POST'])
def login():
    msg = ''
    if request.method == 'POST' and 'username' in request.form and 'password' in request.form:
        username = request.form['username']
        password = request.form['password']
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('SELECT * FROM accounts WHERE username = %s AND password = %s', (username, password))
        account = cursor.fetchone()
        if account:
            session['loggedin'] = True
            session['id'] = account['id']
            session['username'] = account['username']
            msg = 'Logged in successfully!'
            return render_template('home_page.html', msg = msg)
        else:
            msg = 'Incorrect username / password!'
            print(msg)
    return render_template('login_page.html', msg = msg)


#Run flask in debug mode
if __name__ == '__main__':
    app.run(debug=True)
