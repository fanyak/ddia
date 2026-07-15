#!/bin/bash

db_set() {
  echo "$1,$2" >> db.txt
}

db_get() {
  grep "^$1," db.txt | sed "s/^$1,//" | tail -n 1
}