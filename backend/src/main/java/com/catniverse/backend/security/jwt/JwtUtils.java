package com.catniverse.backend.security.jwt;

import com.catniverse.backend.security.user.CatniverseUserDetails;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.List;

@Component
public class JwtUtils {
    private String jwtSecret;
    private int expirationTime;

    public String generateTokenForUser(Authentication authentication) {
        CatniverseUserDetails userPrinciple = (CatniverseUserDetails) authentication.getPrincipal();

        List<String> roles = userPrinciple
                .getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority).toList();

        return Jwts.builder()
                .setSubject(userPrinciple.getEmail())
                .claim("id", userPrinciple.getId())
                .claim("roles", roles)

                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + expirationTime))
                .signWith(key()).compact(); //這一行code is deprecated 要怎麼解決?
    }

    private Key key() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
    }

    public String getUsernameFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key())
                .build()
                .parseClaimsJws(token)
                .getBody().getSubject();
    }
     public boolean validateToken(String token) {
         try {
             Jwts.parserBuilder()
                     .setSigningKey(key())
                     .build()
                     .parseClaimsJws(token);
             return true;
         } catch (ExpiredJwtException | UnsupportedJwtException | MalformedJwtException | SignatureException |
                  IllegalArgumentException e) {
             throw new JwtException(e.getMessage());

         }
     }





}
