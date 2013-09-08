#!/bin/bash

for i in $(ls *.jpg)
do
  echo $i
  convert -resize '180000@>' $i $i
done
