#!/bin/sh

echo "<html>"
echo -e "<head><link rel=\"stylesheet\" href=\"schmux.css\" />\n<script type="text/javascript" src=\"http://code.jquery.com/jquery-1.7.1.min.js\"></script></head>"
echo "<body><table>"
for i in $(seq 1 2 46) ; do
	echo "<tr><td id='P9_${i}_name'></td><td id='P9_$i' class='pin'></td><td id='P9_$(expr $i + 1)' class='pin'></td><td id='P9_$(expr $i + 1)_name'></td>"
	echo "<td class='spacer'></td>"
	echo "<td id='P8_${i}_name'></td><td id='P8_$i' class='pin'></td><td id='P8_$(expr $i + 1)' class='pin'></td><td id='P8_$(expr $i + 1)_name'></td></tr>"
done
echo "</table></body></html>"

