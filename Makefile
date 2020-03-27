LOGIN_DETAILS := ubuntu@birchy.dev
TARGET_NAME   := kafei-py
PORT          := 108

.FORCE:

build: .FORCE
	./gradlew :assemble

update-www:
	cp client/public/global.css www/
	cp client/public/index.html www/
	cp client/public/build/bundle.js www/build/
	cp client/public/build/bundle.css www/build/

deploy: build
	ssh -p $(PORT) $(LOGIN_DETAILS) -- mkdir -p $(TARGET_NAME)
	scp -P $(PORT) build/distributions/$(TARGET_NAME).tar $(LOGIN_DETAILS):$(TARGET_NAME).tar
	ssh -p $(PORT) $(LOGIN_DETAILS) -- tar xf $(TARGET_NAME).tar $(TARGET_NAME)

monitor:
	ssh -p $(PORT) $(LOGIN_DETAILS) -t -- tmux attach
