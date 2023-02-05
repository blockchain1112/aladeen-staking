spl-token create-token --decimals 3 | grep token | awk '{print $3}' | tr -d '\n'
