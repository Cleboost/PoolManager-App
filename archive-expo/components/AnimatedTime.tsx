import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { 
    useAnimatedStyle, 
    withSpring,
    useSharedValue,
    interpolate,
} from 'react-native-reanimated';

interface TimeSegment {
    value: string;
    shouldAnimate: boolean;
}

const TimeSegmentView = ({ value, shouldAnimate, previousValue }: TimeSegment & { previousValue: string }) => {
    const progress = useSharedValue(0);

    React.useEffect(() => {
        if (shouldAnimate && value !== previousValue) {
            progress.value = 0;
            progress.value = withSpring(1, {
                mass: 1,
                damping: 15,
                stiffness: 100,
            });
        }
    }, [value]);

    const oldNumberStyle = useAnimatedStyle(() => ({
        transform: [{
            translateY: shouldAnimate ? interpolate(
                progress.value,
                [0, 1],
                [0, -20]
            ) : 0
        }],
        opacity: shouldAnimate ? interpolate(progress.value, [0, 1], [1, 0]) : 1,
    }));

    const newNumberStyle = useAnimatedStyle(() => ({
        transform: [{
            translateY: shouldAnimate ? interpolate(
                progress.value,
                [0, 1],
                [20, 0]
            ) : 0
        }],
        opacity: shouldAnimate ? progress.value : 1,
    }));

    if (!shouldAnimate) {
        return <Animated.Text style={styles.timeText}>{value}</Animated.Text>;
    }

    return (
        <View style={styles.segmentContainer}>
            <Animated.Text style={[styles.timeText, oldNumberStyle]}>
                {previousValue}
            </Animated.Text>
            <Animated.Text style={[styles.timeText, styles.absolute, newNumberStyle]}>
                {value}
            </Animated.Text>
        </View>
    );
};

export const AnimatedTime = () => {
    const [time, setTime] = React.useState(new Date());
    const [previousTime, setPreviousTime] = React.useState(new Date());

    React.useEffect(() => {
        const interval = setInterval(() => {
            setPreviousTime(time);
            setTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, [time]);

    const segments = [
        { 
            value: time.getHours().toString().padStart(2, '0'),
            shouldAnimate: time.getHours() !== previousTime.getHours()
        },
        { value: ':', shouldAnimate: false },
        { 
            value: time.getMinutes().toString().padStart(2, '0'),
            shouldAnimate: time.getMinutes() !== previousTime.getMinutes()
        },
        { value: ':', shouldAnimate: false },
        { 
            value: time.getSeconds().toString().padStart(2, '0'),
            shouldAnimate: true
        },
    ];

    const previousSegments = [
        previousTime.getHours().toString().padStart(2, '0'),
        ':',
        previousTime.getMinutes().toString().padStart(2, '0'),
        ':',
        previousTime.getSeconds().toString().padStart(2, '0'),
    ];

    return (
        <View style={styles.container}>
            {segments.map((segment, index) => (
                <TimeSegmentView
                    key={index}
                    {...segment}
                    previousValue={previousSegments[index]}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    segmentContainer: {
        height: 20,
        overflow: 'hidden',
        alignItems: 'center',
    },
    timeText: {
        fontSize: 14,
        color: '#666',
    },
    absolute: {
        position: 'absolute',
        left: 0,
        right: 0,
        textAlign: 'center',
    },
});
