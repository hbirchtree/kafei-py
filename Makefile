LOGIN_DETAILS := ubuntu@birchy.dev
TARGET_NAME   := kafei-py
PORT          := 108
ROOTDIR       := $(abspath $(shell dirname $(MAKEFILE_LIST)))

.FORCE:

build: .FORCE | $(ROOTDIR)
	cd $(ROOTDIR) && ./gradlew :assemble

CLIENTROOT := $(ROOTDIR)/client/public
CLIENTROOT_REACT := $(ROOTDIR)/client-react/build
WWWROOT    := $(ROOTDIR)/www

update-www:
	cp $(CLIENTROOT)/global.css $(WWWROOT)/
	cp $(CLIENTROOT)/index.html $(WWWROOT)/
	cp $(CLIENTROOT)/build/bundle.js $(WWWROOT)/build/
	cp $(CLIENTROOT)/build/bundle.css $(WWWROOT)/build/

build-react: .FORCE | $(ROOTDIR)/client-react
	cd $(ROOTDIR)/client-react && npm run build

update-www-react: build-react
	cp -r $(CLIENTROOT_REACT)/* $(WWWROOT)/

BUILDROOT=$(ROOTDIR)/build/distributions

deploy: build
	ssh -p $(PORT) $(LOGIN_DETAILS) -- mkdir -p $(TARGET_NAME)
	scp -P $(PORT) $(BUILDROOT)/$(TARGET_NAME).tar $(LOGIN_DETAILS):$(TARGET_NAME).tar
	ssh -p $(PORT) $(LOGIN_DETAILS) -- tar xf $(TARGET_NAME).tar $(TARGET_NAME)

monitor:
	ssh -p $(PORT) $(LOGIN_DETAILS) -t -- tmux attach
psql:
	ssh -p $(PORT) $(LOGIN_DETAILS) -t -- sudo su postgres -c psql

logs:
	ssh -p $(PORT) $(LOGIN_DETAILS) -t -- journalctl
log-since:
	ssh -p $(PORT) $(LOGIN_DETAILS) -t -- journalctl --since "$(SINCE)"

# Ansible install and boostrapping

ansible-bootstrap:
	ssh -p $(PORT) $(LOGIN_DETAILS) -- sudo apt update
	ssh -p $(PORT) $(LOGIN_DETAILS) -- sudo apt install software-properties-common
	ssh -p $(PORT) $(LOGIN_DETAILS) -- sudo add-apt-repository --yes --update ppa:ansible/ansible
	ssh -p $(PORT) $(LOGIN_DETAILS) -- sudo apt -qy install ansible

ANSIBLEROOT=$(ROOTDIR)/ansible
ANSIBLEPORT=22

#
# Creation of servers
#
ansible-create-server:
	ansible-playbook $(ANSIBLEROOT)/recreate.yml
	@echo "In the AWS Lightsail control panel, enable the following ports:"
	@echo " - HTTPS"
	@echo " - TCP 108"
	@echo " - TCP 8083"
	@echo " - TCP 8883"
	@echo "And attach to static IP"

#
# Initial setup
#
ansible-setup-server:
	ansible-playbook -i $(ANSIBLEROOT)/provisioned-static $(ANSIBLEROOT)/site.yml --ssh-extra-args=-p$(ANSIBLEPORT)

ansible-setup-certs:
	ansible-playbook -i $(ANSIBLEROOT)/provisioned-static $(ANSIBLEROOT)/certs.yml --ssh-extra-args=-p$(ANSIBLEPORT)

ansible-deploy: update-www-react build
	cp $(ROOTDIR)/build/distributions/kafei-py.tar $(ANSIBLEROOT)/roles/deployservice/files
	ansible-playbook -i $(ANSIBLEROOT)/provisioned-static $(ANSIBLEROOT)/deploy-kafei.yml --ssh-extra-args=-p108

ansible-deploy-webapp-%:
	ansible-playbook -i $(ANSIBLEROOT)/provisioned-static $(ANSIBLEROOT)/deploy-$*.yml --ssh-extra-args=-p108

#
# Database operations
#
ansible-backup-db-%:
	ansible-playbook -i $(ANSIBLEROOT)/$* $(ANSIBLEROOT)/backup.yml --ssh-extra-args=-p108
ansible-restore-db:
	ansible-playbook -i $(ANSIBLEROOT)/provisioned-static $(ANSIBLEROOT)/restore.yml --ssh-extra-args=-p$(ANSIBLEPORT)

#
# Composite operations
#
ansible-create: ansible-setup-server ansible-setup-certs ansible-deploy
	@true

ansible-resurrect: ansible-create ansible-restore-db
	@true
