JavaScript requires a server to dynamically load content. For the purpose of this prototype, we can use a local server.

First, make sure python is installed. See https://www.python.org/ for details.

Open a command line and execute the following, replace 'path' to the folder of the website:
cd \path

To start server, execute on command line:
python -m http.server 8080

load the URL:
http://localhost:8080/