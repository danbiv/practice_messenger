-- sudo mysql -u root < 20200224T184700-create_tables.sql

create database dbivona CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

use dbivona;

-- Table needs  Username and Password
create table users (
  username VARCHAR(40) PRIMARY KEY,
  password VARCHAR(60)
);

-- Table needs List of channels and name of creator to enable deletion
create table channels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  author VARCHAR(40)
);

-- Create theadlist
create table threads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title TEXT,
  ochannel VARCHAR(255)
);


-- As chats are created new tables are created
create table Random (
  id INT AUTO_INCREMENT PRIMARY KEY,
  author VARCHAR(40),
  body TEXT,
  timemade datetime
);

-- Base message test
insert into Random (author, body, timemade) values (
  "Admin",
  "This chat I give to you to post anything you gosh darn want",
  '2021-08-26 18:11:50.183774'
);

-- Base channels test

insert into channels (author, title) values (
  "Admin",
  "random_messages"
);


