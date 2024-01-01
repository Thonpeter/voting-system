import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';  // Import Firestore if not already imported

const EmailAuth = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleInput = (text) => {
    setEmail(text);
  };

  const handleLogin = async () => {
    try {
      // Validate email format
      const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
      if (!emailRegex.test(email)) {
        setError('Please enter a valid university email address.');
        return;
      }

      setError('');

      // Check if email exists in the database
      const emailExists = await checkEmailExists(email);
      if (!emailExists) {
        setError('Email address not found. Please sign up first.');
        return;
      }

      // Send email verification link
      await sendVerificationEmail(email);

      // Inform user to check their email
      Alert.alert(
        'Verification Sent',
        'Verification link sent to your email. Please check your inbox.',
        [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
      );

      // Navigate to the next screen (e.g., VerificationScreen) after successful verification
      navigation.navigate('VerificationScreen');
    } catch (error) {
      console.error('Error handling login:', error.message);
      setError('Error handling login. Please try again later.');
    }
  };

  const checkEmailExists = async (email) => {
    try {
      const snapshot = await firebase.firestore().collection('users').where('email', '==', email).get();
      return !snapshot.empty;
    } catch (error) {
      console.error('Error checking email existence:', error.message);
      return false;
    }
  };

  const sendVerificationEmail = async (email) => {
    try {
      await firebase.auth().sendSignInLinkToEmail(email, {
        url: 'YOUR_DEEP_LINK_URL', // Replace with your deep link
        handleCodeInApp: true,
      });
    } catch (error) {
      console.error('Error sending verification link:', error.message);
      throw new Error('Error sending verification link. Please try again later.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter your university email</Text>
      <TextInput
        style={styles.input}
        placeholder='example@university.edu'
        value={email}
        onChangeText={handleInput}
        keyboardType='email-address'
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 18,
    marginBottom: 16,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  error: {
    color: 'red',
    marginBottom: 16,
  },
  button: {
    backgroundColor: 'blue',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default EmailAuth;
