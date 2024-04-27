import json
from flask import *

app = Flask(__name__)
app.secret_key = 'demo'

# developers: make sure you change to the right directory
demoFile = r'C:\Users\thoma\main\Documents\2024\214\website\sensitiveData\users.json'

#verify creds
def verifyCredentials(username, password):
    try:
        with open(demoFile, 'r') as f:
            usersData = json.load(f)
            for user in usersData['users']:
                if user['username'] == username and user['password'] == password:
                    return True
    except FileNotFoundError:
        print(f"File {demoFile} not found.")
    except Exception as e:
        print(f"An error occurred: {e}")
    return False

#login/logout
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        if verifyCredentials(username, password):
            session['loggedIn'] = True  # set session when login
            return redirect(url_for('dashboard'))
        else:
            return 'Invalid username or password'
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('loggedIn', None)  # remove session when logout
    return redirect(url_for('index'))

#main pages
@app.route('/dashboard')
def dashboard():
    loggedIn = session.get('loggedIn', False)  # get loggedIn status from session
    return render_template('dashboard.html', loggedIn=loggedIn)

@app.route('/')
def index():
    loggedIn = session.get('loggedIn', False) 
    return render_template('index.html', loggedIn=loggedIn)

@app.route('/contactUs')
def contact_us():
    loggedIn = session.get('loggedIn', False)
    return render_template('contactUs.html', loggedIn=loggedIn)

@app.route('/bookOnline')
def book_online():
    loggedIn = session.get('loggedIn', False)
    return render_template('bookOnline.html', loggedIn=loggedIn)

@app.route('/about')
def about():
    loggedIn = session.get('loggedIn', False)
    return render_template('about.html', loggedIn=loggedIn)

@app.route('/myAccount')
def myAccount():
    loggedIn = session.get('loggedIn', False)
    return render_template('myAccount.html', loggedIn=loggedIn)

@app.route('/myBookings')
def myBookings():
    loggedIn = session.get('loggedIn', False)
    return render_template('myBookings.html', loggedIn=loggedIn)
    
@app.route('/myFlightServices')
def myFlightServices():
    loggedIn = session.get('loggedIn', False)
    return render_template('myFlightServices.html', loggedIn=loggedIn)

@app.route('/submit_inquiry', methods=['POST'])
def submit_inquiry():
    if request.method == 'POST':
        #process the form data as needed for later development
        form_submitted = True
        return render_template('contactUs.html', form_submitted=form_submitted)
    else:
        # if not POST request, render form normally
        form_submitted = False
        return render_template('contactUs.html', form_submitted=form_submitted)


if __name__ == '__main__':
    app.run(debug=True)
