const fs = require("fs");
const os = require("os");
const { createSSLCertificateFor } = require("./ssl");

const CONFIG_DIR = `${process.env.HOME}/.testserve`;

try {
  fs.mkdirSync(CONFIG_DIR);
} catch (error) {
  // It probably already exists; ignore.
}

const args = process.argv.slice(2);

if (args[0] === "install") {
  switch (os.platform()) {
    case "darwin":
      console.log(`\
We've detected you're running OS X. To get things up and running we need to set up the .test DNS entry and a port forwarding firewall rule so testserve takes over ports 80 and 443 without requiring root privileges.

Please note that you will be responsible for undoing these changes should you wish to uninstall testserve, and due to these changes you may get delays resolving DNS queries when testserve is not running.

  sudo mkdir -p /etc/resolver
  sudo cp ${__dirname}/test.resolver /etc/resolver/test
  sudo cp ${__dirname}/test.firewall.plist /Library/LaunchDaemons/test.firewall.plist
  sudo launchctl load -w /Library/LaunchDaemons/test.firewall.plist

We recommend running testserve all the time using daemon manager. And if you follow the steps bellow you don't need to run \`testserve run\` or using other daemon manager like \`pm2\`.

  cp ${__dirname}/test.testserve.plist ~/Library/LaunchAgents/test.testserve.plist
  launchctl load ~/Library/LaunchAgents/test.testserve.plist\
`);
      break;
    case "linux":
      console.log(`\
We've detected you're running Linux. The following instructions are specifically for Ubuntu (15.10) but you should be able to adjust them to your OS.

We're using dnsmasq to resolve .dev, .test and .test domains to localhost (127.0.0.1), and iptables to redirect ports 12439 and 12443 locally to ports 80 and 443 so we don't need to run with root privileges.

Please note that you will be responsible for undoing these changes should you wish to uninstall testserve. We recommend running testserve all the time using something like \`pm2\`.

  sudo apt-get install dnsmasq
  echo -e "local=/test/\\naddress=/test/127.0.0.1" | sudo tee /etc/dnsmasq.d/test-tld
  sudo service dnsmasq restart
  sudo iptables -t nat -A OUTPUT -o lo -p tcp --dport 80 -j REDIRECT --to-port 12439
  sudo iptables -t nat -A OUTPUT -o lo -p tcp --dport 443 -j REDIRECT --to-port 12443
  sudo iptables-save\
`);
      break;
    default:
      console.log(`\
testserve is only tested on OS X and Ubuntu Linux, but you should be able to make it work on your platform by adding all your local .dev/.test/.test hostnames to your /etc/hosts (or equivalent) file, and redirecting port 12439 to port 80.\
`);
  }

  console.log(`\

Please note that you can change the default HTTP port 12439, HTTPS port 12443, and DNS port 15353 by providing PORT, SSL_PORT and DNS_PORT environment variables, in which case you will also need to modify resolver and firewall files accordingly.\
`);
} else if (args[0] === "run") {
  require("./index");
} else if (args[0] === "ssl") {
  createSSLCertificateFor(args[1]).then(null, e => {
    console.error(e);
    process.exit(1);
  });
} else if ((args.length === 3 && args[0] === "add") || args.length === 2) {
  const configName = args[args.length - 2];
  const path = `${CONFIG_DIR}/${configName}`;
  fs.writeFileSync(path, args[args.length - 1]);
} else {
  console.log(`\
Usage:

  testserve install

    Outputs instructions to install testserve.


  testserve run [--exponential-backoff=25]

    Runs testserve's HTTP, HTTPS and DNS servers.
    (With --exponential-backoff, in the event that your server goes down testserve will queue your request and retry a few times rather than just outputting an error message.)
    It's advised that you run testserve at all times using something like pm2, e.g. with \`pm2 start testserve -- run && pm2 dump\`


  testserve ssl <subdomain>

    Provisions a self-signed SSL certificate for <subdomain> (using \`openssl\`) and prompts you to install it.


  testserve add <subdomain> <destination>

    Tells testserve to respond to request for <subdomain> by:
    - if <destination> is a number then proxying to that port number
    - if <destination> is a path then by serving that folder as static content

\
`);
}
