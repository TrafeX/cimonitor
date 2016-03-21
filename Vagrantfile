Vagrant.require_version ">= 1.5"

Vagrant.configure("2") do |config|

    config.vm.provider :virtualbox do |v|
        v.name = "cimonitor"
        v.customize [
            "modifyvm", :id,
            "--name", "cimonitor",
            "--memory", 1024,
            "--natdnshostresolver1", "on",
            "--cpus", 1,
        ]
    end

    config.vm.box = "ubuntu/trusty64"
    
    config.vm.network :private_network, ip: "192.168.56.84"
    config.ssh.forward_agent = true

    if Vagrant.has_plugin?("vagrant-hostsupdater")
        config.hostsupdater.aliases = [
            "cimonitor.local"
        ]
    end

    config.vm.provision "ansible" do |ansible|
        ansible.playbook = "ansible/playbook.yml"
        ansible.inventory_path = "ansible/inventories/dev"
        ansible.limit = 'all'
    end

    config.vm.synced_folder "./", "/vagrant", type: "nfs"
end
