import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

type Props = {
    children: ReactNode;
};

type State = {
    hasError: boolean;
    error: Error | null;
};

/**
 * App-level error boundary.
 *
 * Catches unhandled JS errors in the React tree and renders a
 * user-friendly fallback instead of a white/blank screen.
 */
export class ErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false, error: null };

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        // Log to your error reporting service here
        console.error('[ErrorBoundary]', error, info.componentStack);
    }

    private handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (!this.state.hasError) {
            return this.props.children;
        }

        return (
            <View
                style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 32,
                    backgroundColor: '#FAFAFA',
                }}
            >
                <Text
                    style={{
                        fontSize: 22,
                        fontWeight: '700',
                        color: '#1A1A1A',
                        marginBottom: 8,
                    }}
                >
                    Something went wrong
                </Text>

                <Text
                    style={{
                        fontSize: 14,
                        color: '#717171',
                        textAlign: 'center',
                        lineHeight: 20,
                        marginBottom: 24,
                    }}
                >
                    An unexpected error occurred. Please try again.
                </Text>

                {__DEV__ && this.state.error && (
                    <View
                        style={{
                            width: '100%',
                            backgroundColor: '#FFF0F0',
                            borderRadius: 12,
                            borderWidth: 1,
                            borderColor: '#FFD4D4',
                            padding: 12,
                            marginBottom: 24,
                        }}
                    >
                        <Text
                            selectable
                            style={{
                                fontSize: 12,
                                fontFamily: 'monospace',
                                color: '#CC0000',
                            }}
                        >
                            {this.state.error.message}
                        </Text>
                    </View>
                )}

                <TouchableOpacity
                    onPress={this.handleRetry}
                    style={{
                        paddingHorizontal: 32,
                        paddingVertical: 14,
                        backgroundColor: '#1A73E8',
                        borderRadius: 12,
                    }}
                >
                    <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 15 }}>
                        Try Again
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }
}
