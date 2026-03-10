docker exec -it lattice-garage garage layout assign -z dc1 -c 1 <node_id>
docker exec -it lattice-garage garage layout apply
docker exec -it lattice-garage garage bucket create lattice
docker exec -it lattice-garage garage key new --name app
docker exec -it lattice-garage garage bucket allow --read --write lattice --key app