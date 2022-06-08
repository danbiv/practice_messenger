My final should run without any additional chats to install:

in order toget tracked and up you have to visit the 
chat first but after that it should work

Rubric (20 points possible) 

Database (5 points) 18


Create database and tables with migrations in version control. Database supports Unicode characters -- DONE(1)
Tables for channels, messages, and users --DONE(1)
Store passwords securely by hashing them with bcrypt -- DONE(1)
Sanitize all database inputs -DONE
Efficiently store last read message per channel per user - Done


API (4 points) 4

Login endpoint --DONE
Authenticate to other endpoints via session token in the request header (not as a URL param) -DONE
Endpoints to create and get channels and messages --DONE
Get new message counts by channel without fetching all the message contentsx -done (0.5)


Responsive Layout (5 points) 4


Login and username update flows -- DONE
Show channels, messages, and replies (when shown) in 3-column grid -DONE
Show/hide threaded replies -DONE
On narrow screens, one-column layout with menu bar ---DONE
Parse image URLs that appear in messages and display the images at the end of the message ---DONE (could use more css)


Single-Page State (4 points) 3.5


Only serve one HTML request -- DONE
Push channel and thread location to the history and navigation bar --DONE
Loading the unique URL of a channel or thread should open the app to that channel or thread. --DONE
Track last read message per channel --Done (0.5)


Asynchronous Request Handling (2 points) 1.5


Continuously poll for new messages, only in the channel the user is in  -DONE
Continuously poll for new unread message counts per channel -- DONE