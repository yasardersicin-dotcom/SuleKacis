package com.example.firebaseauthapp;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;

public class MainActivity extends AppCompatActivity {

    private TextView textViewWelcome, textViewEmail, textViewUid;
    private Button buttonLogout;
    private FirebaseAuth firebaseAuth;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        firebaseAuth = FirebaseAuth.getInstance();

        textViewWelcome = findViewById(R.id.textViewWelcome);
        textViewEmail = findViewById(R.id.textViewEmail);
        textViewUid = findViewById(R.id.textViewUid);
        buttonLogout = findViewById(R.id.buttonLogout);

        // Kullanici bilgilerini goster
        FirebaseUser currentUser = firebaseAuth.getCurrentUser();
        if (currentUser != null) {
            textViewEmail.setText("E-posta: " + currentUser.getEmail());
            textViewUid.setText("Kullanici ID: " + currentUser.getUid());
        }

        buttonLogout.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                firebaseAuth.signOut();
                startActivity(new Intent(MainActivity.this, LoginActivity.class));
                finish();
            }
        });
    }

    @Override
    protected void onStart() {
        super.onStart();
        // Kullanici giris yapmamissa login ekranina yonlendir
        FirebaseUser currentUser = firebaseAuth.getCurrentUser();
        if (currentUser == null) {
            startActivity(new Intent(MainActivity.this, LoginActivity.class));
            finish();
        }
    }
}
