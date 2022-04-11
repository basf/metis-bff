
import logging
import http.client as http_client

import requests
from urllib3.exceptions import InsecureRequestWarning

from pylabconn.api import LC_API


requests.packages.urllib3.disable_warnings(category=InsecureRequestWarning)

http_client.HTTPConnection.debuglevel = 1
logging.basicConfig()
logging.getLogger().setLevel(logging.DEBUG)
rlog = logging.getLogger("requests.packages.urllib3")
rlog.setLevel(logging.DEBUG)
rlog.propagate = True


conn = LC_API(userid="user", userpwd="pass", servertype="dev")
status = conn.connection_connect()
print(status)