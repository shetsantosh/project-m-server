#!/bin/bash

cd /home/ubuntu/project-m-server
pm2 delete server
pm2 start npm -- start