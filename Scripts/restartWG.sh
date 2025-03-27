#! /bin/bash
cd /etc/wireguard
sudo wg-quick down wg0
sleep 5
sudo wg-quick up wg0