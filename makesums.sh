cat sums.txt | awk '{if (length($0) == 7) printf "\""$0"\","}'
