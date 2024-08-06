function handler () {
  EVENT_DATA=$1
  echo "$EVENT_DATA" 1>&2;
  RESPONSE=$(./whitespace-bin main.ws)

  echo $RESPONSE
}