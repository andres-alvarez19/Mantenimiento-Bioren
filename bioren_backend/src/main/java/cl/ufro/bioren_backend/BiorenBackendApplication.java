package cl.ufro.bioren_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.beans.factory.annotation.Autowired;
import cl.ufro.bioren_backend.model.User;
import cl.ufro.bioren_backend.model.UserRole;
import cl.ufro.bioren_backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class BiorenBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BiorenBackendApplication.class, args);
    }

    @Bean
    public CommandLineRunner initAdminUser(@Autowired UserRepository userRepository, @Autowired PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.count() == 0) {
                User admin = User.builder()
                        .name("Administrador")
                        .email("admin@ufrontera.cl")
                        .role(UserRole.BIOREN_ADMIN)
                        .password(passwordEncoder.encode("admin"))
                        .build();
                userRepository.save(admin);
                System.out.println("Usuario administrador por defecto creado: admin@ufrontera.cl / admin");
            }
        };
    }

}
