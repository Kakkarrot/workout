for file in resources/*
do
  sort -u -o "$file" "$file"
done
