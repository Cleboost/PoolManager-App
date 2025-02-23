delete window.$;
let wpRequire;
window.webpackChunkdiscord_app.push([
	[Math.random()],
	{},
	(req) => {
		wpRequire = req;
	},
]);

function createStyledModal(title, markdownMessage) {
	function convertMarkdownToHTML(mdText) {
		return mdText
			.replace(/###### (.*?)(\n|$)/g, '<span style="font-size:12px; color:#BBBBBB;">$1</span><br>') // H6
			.replace(/##### (.*?)(\n|$)/g, '<span style="font-size:14px; color:#AAAAAA;">$1</span><br>') // H5
			.replace(/#### (.*?)(\n|$)/g, '<span style="font-size:16px; color:#999999;">$1</span><br>') // H4
			.replace(/### (.*?)(\n|$)/g, '<span style="font-size:18px; color:#888888;">$1</span><br>') // H3
			.replace(/## (.*?)(\n|$)/g, '<span style="font-size:20px; color:#777777;">$1</span><br>') // H2
			.replace(/# (.*?)(\n|$)/g, '<span style="font-size:22px; font-weight:bold; color:#FFD700;">$1</span><br>') // H1
			.replace(/\*\*(.*?)\*\*/g, '<span style="font-weight:bold; color:#FFFFFF;">$1</span>') // Gras
			.replace(/\*(.*?)\*/g, '<span style="font-style:italic; color:#CCCCCC;">$1</span>') // Italique
			.replace(/`(.*?)`/g, '<span style="font-family:monospace; background:#222; padding:2px 4px; border-radius:4px;">$1</span>') // Code
			.replace(/\n/g, "<br>"); // Retours à la ligne
	}

	let existingModal = document.getElementById("custom-discord-modal");
	if (existingModal) existingModal.remove();

	let modalContainer = document.createElement("div");
	modalContainer.id = "custom-discord-modal";
	modalContainer.style.position = "fixed";
	modalContainer.style.top = "50%";
	modalContainer.style.left = "50%";
	modalContainer.style.transform = "translate(-50%, -50%)";
	modalContainer.style.background = "#36393f";
	modalContainer.style.padding = "20px";
	modalContainer.style.borderRadius = "8px";
	modalContainer.style.boxShadow = "0px 0px 10px rgba(0,0,0,0.5)";
	modalContainer.style.color = "#fff";
	modalContainer.style.zIndex = "10000";
	modalContainer.style.minWidth = "300px";
	modalContainer.style.textAlign = "left";
	modalContainer.style.fontFamily = "Arial, sans-serif";

	let modalTitle = document.createElement("h2");
	modalTitle.innerText = title;
	modalTitle.style.marginBottom = "10px";
	modalTitle.style.color = "#ffffff";
	modalTitle.style.fontSize = "20px";
	modalTitle.style.textAlign = "center";

	let modalContent = document.createElement("div");
	modalContent.innerHTML = convertMarkdownToHTML(markdownMessage);
	modalContent.style.marginBottom = "20px";
	modalContent.style.fontSize = "14px";
	modalContent.style.lineHeight = "1.5";

	let closeButton = document.createElement("button");
	closeButton.innerText = "OK";
	closeButton.style.background = "#5865F2";
	closeButton.style.color = "white";
	closeButton.style.border = "none";
	closeButton.style.padding = "10px 20px";
	closeButton.style.borderRadius = "5px";
	closeButton.style.cursor = "pointer";
	closeButton.style.display = "block";
	closeButton.style.margin = "auto";
	closeButton.onclick = () => modalContainer.remove();

	modalContainer.appendChild(modalTitle);
	modalContainer.appendChild(modalContent);
	modalContainer.appendChild(closeButton);
	document.body.appendChild(modalContainer);
}

// ✅ Fonction pour créer la barre de progression
function createProgressBar() {
    let existingBar = document.getElementById("custom-progress-bar");
    if (existingBar) existingBar.remove(); // Supprime si elle existe déjà

    // 🔹 Conteneur de la barre
    let progressContainer = document.createElement("div");
    progressContainer.id = "custom-progress-bar";
    progressContainer.style.position = "fixed";
    progressContainer.style.bottom = "10px";
    progressContainer.style.right = "10px";
    progressContainer.style.width = "200px";
    progressContainer.style.height = "20px";
    progressContainer.style.background = "#222";
    progressContainer.style.borderRadius = "10px";
    progressContainer.style.overflow = "hidden";
    progressContainer.style.boxShadow = "0px 0px 5px rgba(0, 0, 0, 0.3)";
    progressContainer.style.zIndex = "10000";
    progressContainer.style.display = "flex";
    progressContainer.style.alignItems = "center";

    // 🔹 Barre de progression
    let progressBar = document.createElement("div");
    progressBar.id = "custom-progress-fill";
    progressBar.style.width = "0%";
    progressBar.style.height = "100%";
    progressBar.style.background = "linear-gradient(90deg, #ff4e50, #fc913a)";
    progressBar.style.transition = "width 0.4s ease-in-out";

    // 🔹 Texte du pourcentage
    let progressText = document.createElement("span");
    progressText.id = "custom-progress-text";
    progressText.innerText = "0%";
    progressText.style.position = "absolute";
    progressText.style.width = "100%";
    progressText.style.textAlign = "center";
    progressText.style.color = "white";
    progressText.style.fontSize = "14px";
    progressText.style.fontWeight = "bold";
    progressText.style.fontFamily = "Arial, sans-serif";

    // 🏗️ Ajouter les éléments dans le DOM
    progressContainer.appendChild(progressBar);
    progressContainer.appendChild(progressText);
    document.body.appendChild(progressContainer);
}

// ✅ Fonction pour mettre à jour la barre de progression
function updateProgressBar(percentage) {
    let progressBar = document.getElementById("custom-progress-fill");
    let progressText = document.getElementById("custom-progress-text");

    if (!progressBar || !progressText) return;

    percentage = Math.round(Math.max(0, Math.min(100, percentage))); // Clamp entre 0 et 100

    progressBar.style.width = percentage + "%";
    progressText.innerText = percentage + "%";

    // 🌈 Changer la couleur selon le pourcentage
    if (percentage < 30) {
        progressBar.style.background = "linear-gradient(90deg, #ff4e50, #fc913a)";
    } else if (percentage < 70) {
        progressBar.style.background = "linear-gradient(90deg, #f9d423, #ff4e50)";
    } else {
        progressBar.style.background = "linear-gradient(90deg, #1D976C, #93F9B9)";
    }
}

// ✅ Fonction pour supprimer la barre de progression
function removeProgressBar() {
    let progressBar = document.getElementById("custom-progress-bar");
    if (progressBar) progressBar.remove();
}

let ApplicationStreamingStore = Object.values(wpRequire.c).find((x) => x?.exports?.Z?.__proto__?.getStreamerActiveStreamMetadata).exports.Z;
let RunningGameStore = Object.values(wpRequire.c).find((x) => x?.exports?.ZP?.getRunningGames).exports.ZP;
let QuestsStore = Object.values(wpRequire.c).find((x) => x?.exports?.Z?.__proto__?.getQuest).exports.Z;
let ChannelStore = Object.values(wpRequire.c).find((x) => x?.exports?.Z?.__proto__?.getAllThreadsForParent).exports.Z;
let GuildChannelStore = Object.values(wpRequire.c).find((x) => x?.exports?.ZP?.getSFWDefaultChannel).exports.ZP;
let FluxDispatcher = Object.values(wpRequire.c).find((x) => x?.exports?.Z?.__proto__?.flushWaitQueue).exports.Z;
let api = Object.values(wpRequire.c).find((x) => x?.exports?.tn?.get).exports.tn;

let quest = [...QuestsStore.quests.values()].find((x) => x.id !== "1248385850622869556" && x.userStatus?.enrolledAt && !x.userStatus?.completedAt && new Date(x.config.expiresAt).getTime() > Date.now());
let isApp = navigator.userAgent.includes("Electron/");
if (!quest) {
	console.log("You don't have any uncompleted quests!");
} else {
	const pid = Math.floor(Math.random() * 30000) + 1000;

	const applicationId = quest.config.application.id;
	const applicationName = quest.config.application.name;
	const taskName = ["WATCH_VIDEO", "PLAY_ON_DESKTOP", "STREAM_ON_DESKTOP", "PLAY_ACTIVITY"].find((x) => quest.config.taskConfig.tasks[x] != null);
	const secondsNeeded = quest.config.taskConfig.tasks[taskName].target;
	const secondsDone = quest.userStatus?.progress?.[taskName]?.value ?? 0;

    createProgressBar();
    updateProgressBar((secondsDone / secondsNeeded) * 100);

	if (taskName === "WATCH_VIDEO") {
		const tolerance = 2,
			speed = 10;
		const diff = Math.floor((Date.now() - new Date(quest.userStatus.enrolledAt).getTime()) / 1000);
		const startingPoint = Math.min(Math.max(Math.ceil(secondsDone), diff), secondsNeeded);
		let fn = async () => {
			for (let i = startingPoint; i <= secondsNeeded; i += speed) {
				try {
					await api.post({ url: `/quests/${quest.id}/video-progress`, body: { timestamp: Math.min(secondsNeeded, i + Math.random()) } });
				} catch (ex) {
					console.log("Failed to send increment of", i, ex.message);
				}
				await new Promise((resolve) => setTimeout(resolve, tolerance * 1000));
			}
			if ((secondsNeeded - secondsDone) % speed !== 0) {
				await api.post({ url: `/quests/${quest.id}/video-progress`, body: { timestamp: secondsNeeded } });
			}
			console.log("Quest completed!");
			createStyledModal(
                "🎉 Quest Completed!",
                `
                # ✅ Mission accomplished!
                **Congratulations!** You have successfully completed the quest.
                🎮 **Application**: *${applicationName}*
                🎥 **Video length**: \`${Math.ceil(secondsNeeded / 60)} minutes\`
                🏆 **Reward unlocked!** 🎁
                `
            );
		};
		fn();
		console.log(`Spoofing video for ${applicationName}. Wait for ${Math.ceil(((secondsNeeded - startingPoint) / speed) * tolerance)} more seconds.`);
	} else if (taskName === "PLAY_ON_DESKTOP") {
		if (!isApp) {
			console.log("This no longer works in browser for non-video quests. Use the desktop app to complete the", applicationName, "quest!");
		}

		api.get({ url: `/applications/public?application_ids=${applicationId}` }).then((res) => {
			const appData = res.body[0];
			const exeName = appData.executables.find((x) => x.os === "win32").name.replace(">", "");

			const games = RunningGameStore.getRunningGames();
			const fakeGame = {
				cmdLine: `C:\\Program Files\\${appData.name}\\${exeName}`,
				exeName,
				exePath: `c:/program files/${appData.name.toLowerCase()}/${exeName}`,
				hidden: false,
				isLauncher: false,
				id: applicationId,
				name: appData.name,
				pid: pid,
				pidPath: [pid],
				processName: appData.name,
				start: Date.now(),
			};
			games.push(fakeGame);
			FluxDispatcher.dispatch({ type: "RUNNING_GAMES_CHANGE", removed: [], added: [fakeGame], games: games });

			let fn = (data) => {
				let progress = quest.config.configVersion === 1 ? data.userStatus.streamProgressSeconds : Math.floor(data.userStatus.progress.PLAY_ON_DESKTOP.value);
				console.log(`Quest progress: ${progress}/${secondsNeeded}`);

				if (progress >= secondsNeeded) {
					console.log("Quest completed!");
					createStyledModal(
						"🎉 Quest Completed!",
						`
                        # ✅ Mission accomplished!
                        **Congratulations!** You have successfully completed the quest.
                        🎮 **Application**: *${applicationName}*
                        ⏳ **Time played**: \`${Math.ceil(secondsNeeded / 60)} minutes\`
                        🏆 **Reward unlocked!** 🎁
                        `
					);

                    removeProgressBar();

					const idx = games.indexOf(fakeGame);
					if (idx > -1) {
						games.splice(idx, 1);
						FluxDispatcher.dispatch({ type: "RUNNING_GAMES_CHANGE", removed: [fakeGame], added: [], games: [] });
					}
					FluxDispatcher.unsubscribe("QUESTS_SEND_HEARTBEAT_SUCCESS", fn);
				}
			};
			FluxDispatcher.subscribe("QUESTS_SEND_HEARTBEAT_SUCCESS", fn);

			console.log(`Spoofed your game to ${applicationName}. Wait for ${Math.ceil((secondsNeeded - secondsDone) / 60)} more minutes.`);
			createStyledModal(
				"🎮 New Quest Started!",
				`
                # Quest Started!
                **Application**: ${applicationName}
                **Objective**: *Play for ${Math.ceil(secondsNeeded / 60)} minutes*
                **Time remaining**: \`${Math.ceil((secondsNeeded - secondsDone) / 60)} minutes\`
                `
			);
		});
	} else if (taskName === "STREAM_ON_DESKTOP") {
		if (!isApp) {
			console.log("This no longer works in browser for non-video quests. Use the desktop app to complete the", applicationName, "quest!");
		}

		let realFunc = ApplicationStreamingStore.getStreamerActiveStreamMetadata;
		ApplicationStreamingStore.getStreamerActiveStreamMetadata = () => ({
			id: applicationId,
			pid,
			sourceName: null,
		});

		let fn = (data) => {
			let progress = quest.config.configVersion === 1 ? data.userStatus.streamProgressSeconds : Math.floor(data.userStatus.progress.STREAM_ON_DESKTOP.value);
			console.log(`Quest progress: ${progress}/${secondsNeeded}`);
            updateProgressBar((progress / secondsNeeded) * 100);

			if (progress >= secondsNeeded) {
				console.log("Quest completed!");
                createStyledModal(
                    "🎉 Quest Completed!",
                    `
                    # ✅ Mission accomplished!
                    **Congratulations!** You have successfully completed the quest.
                    🎮 **Application**: *${applicationName}*
                    🎥 **Stream length**: \`${Math.ceil(secondsNeeded / 60)} minutes\`
                    🏆 **Reward unlocked!** 🎁
                    `
                );

                removeProgressBar();

				ApplicationStreamingStore.getStreamerActiveStreamMetadata = realFunc;
				FluxDispatcher.unsubscribe("QUESTS_SEND_HEARTBEAT_SUCCESS", fn);
			}
		};
		FluxDispatcher.subscribe("QUESTS_SEND_HEARTBEAT_SUCCESS", fn);

		console.log(`Spoofed your stream to ${applicationName}. Stream any window in vc for ${Math.ceil((secondsNeeded - secondsDone) / 60)} more minutes.`);
		console.log("Remember that you need at least 1 other person to be in the vc!");
        createStyledModal(
            "🎥 New Quest Started!",
            `
            # Quest Started!
            **Application**: ${applicationName}
            **Objective**: *Stream for ${Math.ceil(secondsNeeded / 60)} minutes*
            **Time remaining**: \`${Math.ceil((secondsNeeded - secondsDone) / 60)} minutes\`

            **Note**: You need at least 1 other person in the voice channel.
            `
        );
	} else if (taskName === "PLAY_ACTIVITY") {
		const channelId = ChannelStore.getSortedPrivateChannels()[0]?.id ?? Object.values(GuildChannelStore.getAllGuilds()).find((x) => x != null && x.VOCAL.length > 0).VOCAL[0].channel.id;
		const streamKey = `call:${channelId}:1`;

		let fn = async () => {
			console.log("Completing quest", applicationName, "-", quest.config.messages.questName);
            createStyledModal(
                "🎮 New Quest Started!",
                `
                # Quest Started!
                **Application**: ${applicationName}
                **Objective**: *Play for ${Math.ceil(secondsNeeded / 60)} minutes*
                **Time remaining**: \`${Math.ceil((secondsNeeded - secondsDone) / 60)} minutes\`
                `
            );

			while (true) {
				const res = await api.post({ url: `/quests/${quest.id}/heartbeat`, body: { stream_key: streamKey, terminal: false } });
				const progress = res.body.progress.PLAY_ACTIVITY.value;
				console.log(`Quest progress: ${progress}/${secondsNeeded}`);

				await new Promise((resolve) => setTimeout(resolve, 20 * 1000));

                updateProgressBar((progress / secondsNeeded) * 100);

				if (progress >= secondsNeeded) {
					await api.post({ url: `/quests/${quest.id}/heartbeat`, body: { stream_key: streamKey, terminal: true } });
					break;
				}
			}

			console.log("Quest completed!");
            createStyledModal(
                "🎉 Quest Completed!",
                `
                # ✅ Mission accomplished!
                **Congratulations!** You have successfully completed the quest.
                🎮 **Application**: *${applicationName}*
                ⏳ **Time played**: \`${Math.ceil(secondsNeeded / 60)} minutes\`
                🏆 **Reward unlocked!** 🎁
                `
            );
            removeProgressBar();
		};
		fn();
	}
}
