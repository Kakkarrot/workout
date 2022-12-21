#sort -u arms.txt | tee resources/arms.txt
#sort -u back.txt | tee back.txt
#sort -u chest.txt | tee chest.txt
#sort -u core.txt | tee core.txt
#sort -u arms.txt | tee arms.txt
#SCRIPT_PATH="$( pwd; )";
#resources=${SCRIPT_PATH%%/}/resources;

for file in resources/*
do
  sort -u -o "$file" "$file"
done
