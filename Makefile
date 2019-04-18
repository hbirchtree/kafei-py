LOGIN_DETAILS := ubuntu@54.93.138.180
TARGET_NAME := kafei-py

.FORCE:

build: .FORCE
	./gradlew :assemble

deploy: build
	ssh $(LOGIN_DETAILS) -- mkdir -p $(TARGET_NAME)
	scp build/distributions/$(TARGET_NAME).tar $(LOGIN_DETAILS):$(TARGET_NAME).tar
	ssh $(LOGIN_DETAILS) -- tar xf $(TARGET_NAME).tar $(TARGET_NAME)

monitor:
	ssh $(LOGIN_DETAILS) -t -- tmux attach
