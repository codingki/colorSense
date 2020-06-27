import React, { useEffect, useState } from 'react';
import {
	StyleSheet,
	Text,
	View,
	Animated,
	Dimensions,
	TouchableWithoutFeedback,
	Easing,
	StatusBar,
	AsyncStorage,
} from 'react-native';
const { width, height } = Dimensions.get('window');
import Constants from 'expo-constants';
import { Audio } from 'expo-av';
const bounce = new Animated.Value(0);
const duration = new Animated.Value(0);
const highScoreAnim = new Animated.Value(0);
export default function App() {
	const [color, setColor] = useState(null);
	const [wrongColor, setWrongColor] = useState(null);
	const [backgroundColor, setBackgroundColor] = useState(null);
	const [score, setScore] = useState(0);
	const [currentLevel, setCurrentLevel] = useState(1);
	const [wrongBox, setWrongBox] = useState(null);
	const [status, setStatus] = useState('win');
	const [highScore, setHighScore] = useState(0);
	const [newHighScore, setNewHighScore] = useState('YOUR SCORE');
	const level = {
		1: {
			box: 3,
			width: 3,
		},
		2: {
			box: 4,
			width: 2,
		},
		3: {
			box: 6,
			width: 3,
		},
		4: {
			box: 9,
			width: 3,
		},
	};

	useEffect(() => {
		AsyncStorage.getItem('highScore', (error, result) => {
			if (result) {
				setHighScore(result);
			} else {
				setHighScore(0);
			}
		}).catch((e) => setHighScore(0));
		getRandomColor();
		bouncing();
	}, []);
	useEffect(() => {
		right();
	}, [score]);

	const bouncing = () => {
		Animated.timing(bounce, {
			toValue: 0.8,
			duration: 500,
			easing: Easing.bounce,
		}).start(({ finihed }) => {
			timeOut();
		});
	};

	const timeOut = () => {
		if (score !== 0) {
			Animated.timing(duration, {
				toValue: 1,
				duration: 3000,
			}).start(({ finished }) => {
				if (finished) {
					wrong();
				}
			});
		}
	};
	const timeOver = () => {
		Animated.timing(duration, {
			toValue: 1,
			duration: 500,
			easing: Easing.bounce,
		}).start(({ finished }) => {});
	};
	const timeClose = () => {
		Animated.timing(duration, {
			toValue: 0,
			duration: 500,
			easing: Easing.bounce,
		}).start(({ finished }) => {
			changeLevel(score);
		});
	};

	const right = () => {
		highScoreOpacityGone();
		timeClose();
		Animated.timing(bounce, {
			toValue: 0,
			duration: 500,
			easing: Easing.in,
		}).start(({ finihed }) => {
			setStatus('win');
			getRandomColor();
			bouncing();
		});
	};

	const highScoreOpacity = () => {
		Animated.timing(highScoreAnim, {
			toValue: 1,
			duration: 250,
			easing: Easing.in,
		}).start(({ finihed }) => {});
	};

	const highScoreOpacityGone = () => {
		Animated.timing(highScoreAnim, {
			toValue: 0,
			duration: 250,
			easing: Easing.in,
		}).start(({ finihed }) => {});
	};

	const wrong = () => {
		checkHighScore();
		wrongSound();
		Animated.spring(bounce, {
			toValue: 1,
			duration: 500,
			easing: Easing.cubic,
		}).start(({ finished }) => {
			highScoreOpacity();
			setStatus('lose');
		});
	};

	function changeLevel(s) {
		if (s < 5) {
			setCurrentLevel(1);
			setWrongBox(getRandomInt(level[1].box));
		} else if (s < 10) {
			setCurrentLevel(2);
			setWrongBox(getRandomInt(level[2].box));
		} else if (s < 15) {
			setCurrentLevel(3);
			setWrongBox(getRandomInt(level[3].box));
		} else if (s < 20) {
			setCurrentLevel(4);
			setWrongBox(getRandomInt(level[4].box));
		} else if (s > 20) {
			const rand = getRandomInt(4);
			setCurrentLevel(rand);

			setWrongBox(getRandomInt(level[rand].box));
		}
	}

	function getRandomColor() {
		const h = Math.floor(Math.random() * 360);
		const s = 50;
		const l = 50;
		const wb = 60;
		setColor('hsl(' + h + ',50%,50%)');
		setWrongColor('hsl(' + h + ',60%,50%)');

		setBackgroundColor('hsl(' + h + ',30%,30%)');
	}

	function getRandomInt(lvl) {
		const min = Math.ceil(1);
		const max = Math.floor(lvl);
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
	function boxPressed(i) {
		if (i == wrongBox) {
			if (status == 'lose') {
				restart();
			} else {
				win();
			}
		} else {
			gameOver();
		}
	}

	function restart() {
		if (score == 0) {
			right();
		} else {
			setScore(0);
		}
	}

	function gameOver() {
		timeOver();
		wrong();
	}

	function win() {
		setScore(score + 1);
	}
	function desktop() {
		if (width > 800) {
			return true;
		} else {
			return false;
		}
	}
	function Box() {
		let boxes = [];

		for (let i = 1; i <= level[currentLevel].box; i++) {
			if (i == wrongBox) {
				boxes.push(
					<TouchableWithoutFeedback
						key={i}
						onPress={() => {
							rightSound();
							boxPressed(i);
						}}
					>
						<Animated.View
							style={{
								backgroundColor: wrongColor,
								width: desktop()
									? 600 / level[currentLevel].width
									: width / level[currentLevel].width,
								height: desktop()
									? 600 / level[currentLevel].width
									: width / level[currentLevel].width,
								transform: [{ scale: bounce }],
							}}
						></Animated.View>
					</TouchableWithoutFeedback>
				);
			} else {
				boxes.push(
					<TouchableWithoutFeedback
						key={i}
						onPress={() => {
							boxPressed(i);
						}}
					>
						<Animated.View
							style={{
								backgroundColor: color,
								width: desktop()
									? 600 / level[currentLevel].width
									: width / level[currentLevel].width,
								height: desktop()
									? 600 / level[currentLevel].width
									: width / level[currentLevel].width,
								transform: [{ scale: bounce }],
							}}
						></Animated.View>
					</TouchableWithoutFeedback>
				);
			}
		}
		return boxes;
	}

	// function to play sound
	const rightSound = async () => {
		const soundRight = new Audio.Sound();
		await soundRight.loadAsync(require('../assets/right.wav'));
		await soundRight.setPositionAsync(0);
		await soundRight
			.playAsync()
			.then(async (playbackStatus) => {
				setTimeout(() => {
					soundRight.unloadAsync();
				}, 500);
			})
			.catch((error) => {
				console.log(error);
			});
	};

	const wrongSound = async () => {
		const soundWrong = new Audio.Sound();
		await soundWrong.loadAsync(require('../assets/wrong.wav'));
		await soundWrong.setPositionAsync(0);
		await soundWrong
			.playAsync()
			.then(async (playbackStatus) => {
				setTimeout(() => {
					soundWrong.unloadAsync();
				}, 600);
			})
			.catch((error) => {
				console.log(error);
			});
	};

	async function checkHighScore() {
		if (score > highScore) {
			try {
				await AsyncStorage.setItem('highScore', JSON.stringify(score));
				setHighScore(score);
				setNewHighScore('NEW HIGH SCORE');
			} catch (error) {
				console.log(error);
			}
		} else {
			setNewHighScore('YOUR SCORE');
		}
	}

	return (
		<View
			style={{
				flex: 1,
				backgroundColor: backgroundColor,
				alignItems: 'center',
				justifyContent: 'center',
			}}
		>
			<View
				style={{
					width: width,
					alignItems: 'center',
					justifyContent: 'flex-start',
				}}
			>
				<View
					style={{
						flexDirection: 'row',
					}}
				>
					<Animated.View
						style={{
							flex: duration,
							height: Constants.statusBarHeight + 4,
							backgroundColor: wrongColor,
						}}
					></Animated.View>
				</View>
				<View style={{ paddingTop: 20 }}>
					<Animated.View style={{ opacity: highScoreAnim }}>
						<Text
							style={{
								textAlign: 'center',
								fontSize: 30,
								color: wrongColor,
								fontFamily: 'squada-one',
							}}
						>
							HIGH SCORE : {highScore}
						</Text>

						<Text
							style={{
								paddingTop: 20,
								textAlign: 'center',
								fontSize: 30,
								color: wrongColor,
								fontFamily: 'squada-one',
							}}
						>
							{newHighScore}
						</Text>
					</Animated.View>
					<Text
						style={{
							textAlign: 'center',
							fontSize: 50,
							color: wrongColor,
							fontFamily: 'squada-one',
						}}
					>
						{score}
					</Text>
				</View>
			</View>
			<View
				style={{
					flex: 3,
					width: width > 800 && 600,
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				<View
					style={{
						flex: 1,
						flexDirection: 'row',
						flexWrap: 'wrap',
						justifyContent: 'center',
						alignItems: 'center',
						alignContent: 'center',
					}}
				>
					<Box />
				</View>
			</View>
		</View>
	);
}
