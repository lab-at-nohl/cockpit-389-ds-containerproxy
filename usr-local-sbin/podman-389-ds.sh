#!/bin/bash

CONTAINER_NAME=389-ds
DEBUG=/tmp/proxy_dev.log

# PATCH SOURCE
# find src/ -type f -name "*.jsx" -exec sed -i'' -e 's/%2fvar%2frun%2fslapd-/%2fdata%2frun%2fslapd-/g' {} \;
# find src/ -type f -name "*.jsx" -exec sed -i'' -e 's/"dsctl",/"podman-389-ds.sh", "dsctl",/g' {} \;
# find src/ -type f -name "*.jsx" -exec sed -i'' -e 's/"dsconf",/"podman-389-ds.sh", "dsconf",/g' {} \;
# find src/ -type f -name "*.jsx" -exec sed -i'' -e 's/'"'"'dsconf'"'"',/'"'"'podman-389-ds.sh'"'"', '"'"'dsconf'"'"',/g' {} \;
# find src/ -type f -name "*.jsx" -exec sed -i'' -e 's/"dsidm",/"podman-389-ds.sh", "dsidm",/g' {} \;
#
# manually modify ldapsearch, ldapmodify, ldapdelete, /usr/bin/sh, /bin/sh and dscreate in src/*

PODID=`podman ps --filter name=$CONTAINER_NAME --format {{.ID}}`
if [ "$PODID" == "" ]; then
  podman start $CONTAINER_NAME > /dev/null

  if [[ "$1" == "dsctl" && "$@" == *" -l"* ]]; then
    echo \{\"type\":\"result\",\"insts\":\[\]\}\}
    exit 1
  fi
fi
PODMAN="podman exec -it $PODID"

# SIMULATE dsctl FUNCTIONS FOR CONTAINERS
if [[ "$1" == "dsctl" ]]; then

  INSTANCE=`echo "$@" | awk '{print $(NF-1)}'`

  if [[ "$@" == *" status" ]]; then
    $PODMAN ps aux | grep -q "/usr/sbin/ns-slapd -D /etc/dirsrv/slapd-$INSTANCE"
    RUNNING=$?

    if [[ "$@" == *"-j"* ]]; then
      JSON=\{\"type\":\"result\",\"running\":\"
      if [[ $RUNNING == 0 ]]; then
        JSON=${JSON}true
      else
        JSON=${JSON}false
      fi
      JSON=${JSON}\"\}
      echo $JSON
    else
      echo -n "Instance \"$INSTANCE\" is "
      [[ $RUNNING == 0 ]] || echo -n "not "
      echo running
    fi
  exit 0
  fi

  if [[ "$@" == *" start" ]]; then
    [ -z $DEBUG ] || echo podman start $CONTAINER_NAME >> $DEBUG
    podman start $CONTAINER_NAME > /dev/null
    echo "{}"
    exit 0
  fi
  if [[ "$@" == *" stop" ]]; then
    [ -z $DEBUG ] || echo podman stop $CONTAINER_NAME >> $DEBUG
    podman stop $CONTAINER_NAME > /dev/null
    echo "{}"
    exit 0
  fi
  if [[ "$@" == *" restart" ]]; then
    [ -z $DEBUG ] || echo podman restart $CONTAINER_NAME >> $DEBUG
    podman restart $CONTAINER_NAME > /dev/null
    exit 0
  fi

  # ALLOW dsctl OFFLINE - e.g. backup restore
  if [[ "$@" == *" bak2db "* ]]; then
    VOLUMES=`podman inspect -f '{{ .Mounts }}' 302f3bc39e8e | tr -d '[]' | tr '{' '\n' | awk 'NF {print "-v " $2 ":" $3 ":z"}' | xargs`
    podman stop $CONTAINER_NAME
    [ -z $DEBUG ] || echo podman run -ti --entrypoint=/usr/sbin/dsctl --name=$CONTAINER_NAME-maintenance $VOLUMES 389-ds ${@:2} >> $DEBUG
    podman run -ti --entrypoint=/usr/sbin/dsctl --name=$CONTAINER_NAME-maintenance $VOLUMES 389-ds ${@:2} > /dev/null
    podman rm $CONTAINER_NAME-maintenance
    podman start $CONTAINER_NAME
    exit 0
  fi
fi

$PODMAN "$@"

#### DEVEL LOG ####
[ -z $DEBUG ] || echo $PODMAN "$@" >> $DEBUG

